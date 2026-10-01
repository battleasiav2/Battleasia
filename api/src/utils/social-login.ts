import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';
import { OAuthTicket } from '../models/OAuthTicket.js';
import { getAppSettings, normalizeOAuthSettings, type OAuthSettings } from '../models/AppSettings.js';
import { generateReferralCode } from './serialize.js';

export type SocialProvider = 'google' | 'discord';

const STATE_COOKIE = 'ba_oauth_state';
const NEXT_COOKIE = 'ba_oauth_next';

export function isSocialProvider(value: string): value is SocialProvider {
  return value === 'google' || value === 'discord';
}

export async function loadOAuthSettings() {
  const settings = await getAppSettings();
  return normalizeOAuthSettings(settings.oauth);
}

export function providerReady(settings: OAuthSettings, provider: SocialProvider) {
  if (provider === 'google') {
    return settings.googleEnabled && Boolean(settings.googleClientId && settings.googleClientSecret);
  }
  return settings.discordEnabled && Boolean(settings.discordClientId && settings.discordClientSecret);
}

export function publicOrigin(req: Request, settings: OAuthSettings) {
  const forwarded = req.headers['x-forwarded-host'];
  const host = (Array.isArray(forwarded) ? forwarded[0] : forwarded) || req.headers.host || '';
  const protoHeader = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader || req.protocol || 'http').split(',')[0].trim();
  const fromRequest = host ? `${proto}://${host}` : '';
  const internal = !fromRequest || /:(5050)(?:$|\/)/.test(fromRequest) || fromRequest.includes('://api');
  const configured = (settings.redirectBase || env.appUrl || '').replace(/\/$/, '');
  return (internal ? configured : fromRequest).replace(/\/$/, '');
}

export function callbackUrl(origin: string, provider: SocialProvider) {
  return `${origin}/api/v2/users/oauth/${provider}/callback`;
}

export function safeNextPath(value: string | undefined) {
  if (!value) return '/user/play';
  if (value.startsWith('/user/') || value.startsWith('/dashboard') || value.startsWith('/profile/')) return value;
  return '/user/play';
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 10 * 60 * 1000,
  };
}

export function beginOAuth(res: Response, provider: SocialProvider, state: string, returnTo: string) {
  res.cookie(STATE_COOKIE, `${provider}:${state}`, cookieOptions());
  res.cookie(NEXT_COOKIE, safeNextPath(returnTo), cookieOptions());
}

export function readOAuthCookies(req: Request) {
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies || {};
  const raw = cookies[STATE_COOKIE] || '';
  const splitAt = raw.indexOf(':');
  const provider = splitAt > 0 ? raw.slice(0, splitAt) : '';
  const state = splitAt > 0 ? raw.slice(splitAt + 1) : '';
  return {
    provider: isSocialProvider(provider) ? provider : null,
    state,
    next: safeNextPath(cookies[NEXT_COOKIE]),
  };
}

export function clearOAuthCookies(res: Response) {
  res.clearCookie(STATE_COOKIE, { path: '/' });
  res.clearCookie(NEXT_COOKIE, { path: '/' });
}

export function sameSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length || left.length === 0) return false;
  return crypto.timingSafeEqual(left, right);
}

export function authorizeUrl(settings: OAuthSettings, provider: SocialProvider, origin: string, state: string) {
  if (provider === 'google') {
    const params = new URLSearchParams({
      client_id: settings.googleClientId,
      redirect_uri: callbackUrl(origin, provider),
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
  const params = new URLSearchParams({
    client_id: settings.discordClientId,
    redirect_uri: callbackUrl(origin, provider),
    response_type: 'code',
    scope: 'identify email',
    state,
  });
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

export async function createOAuthTicket(input: {
  provider: SocialProvider;
  returnTo: string;
  origin: string;
  handoff: boolean;
}) {
  const state = crypto.randomBytes(24).toString('hex');
  const handoffKey = input.handoff ? crypto.randomBytes(24).toString('hex') : '';
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await OAuthTicket.create({
    kind: 'state',
    key: state,
    provider: input.provider,
    returnTo: safeNextPath(input.returnTo),
    origin: input.origin,
    handoffKey,
    expiresAt,
  });
  if (handoffKey) {
    await OAuthTicket.create({
      kind: 'handoff',
      key: handoffKey,
      provider: input.provider,
      status: 'pending',
      expiresAt,
    });
  }
  return { state, handoffKey };
}

export async function takeOAuthState(state: string) {
  if (!/^[a-f0-9]{48}$/.test(state)) return null;
  return OAuthTicket.findOneAndDelete({ kind: 'state', key: state, expiresAt: { $gt: new Date() } });
}

export async function completeHandoff(key: string, accessToken: string, refreshToken: string, userJson: string) {
  if (!key) return;
  await OAuthTicket.updateOne(
    { kind: 'handoff', key, status: 'pending' },
    { $set: { status: 'done', accessToken, refreshToken, userJson } }
  );
}

export async function failHandoff(key: string, error: string) {
  if (!key) return;
  await OAuthTicket.updateOne(
    { kind: 'handoff', key, status: 'pending' },
    { $set: { status: 'error', error: error.slice(0, 200) } }
  );
}

export async function readHandoff(key: string) {
  if (!/^[a-f0-9]{48}$/.test(key)) return null;
  const row = await OAuthTicket.findOne({ kind: 'handoff', key, expiresAt: { $gt: new Date() } });
  if (!row) return null;
  if (row.status === 'pending') return { pending: true as const };
  const payload = {
    pending: false as const,
    error: row.error || '',
    accessToken: row.accessToken || '',
    refreshToken: row.refreshToken || '',
    userJson: row.userJson || '',
  };
  await OAuthTicket.deleteOne({ _id: row._id });
  return payload;
}

type Profile = { id: string; email: string; name: string; avatar: string };

async function googleProfile(settings: OAuthSettings, origin: string, code: string): Promise<Profile> {
  const body = new URLSearchParams({
    code,
    client_id: settings.googleClientId,
    client_secret: settings.googleClientSecret,
    redirect_uri: callbackUrl(origin, 'google'),
    grant_type: 'authorization_code',
  });
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!tokenRes.ok) throw new Error('failed');
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) throw new Error('failed');
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!profileRes.ok) throw new Error('failed');
  const profile = (await profileRes.json()) as { sub?: string; email?: string; name?: string; picture?: string };
  if (!profile.sub) throw new Error('failed');
  if (!profile.email) throw new Error('email');
  return {
    id: profile.sub,
    email: profile.email.toLowerCase().trim(),
    name: profile.name || '',
    avatar: profile.picture || '',
  };
}

async function discordProfile(settings: OAuthSettings, origin: string, code: string): Promise<Profile> {
  const body = new URLSearchParams({
    code,
    client_id: settings.discordClientId,
    client_secret: settings.discordClientSecret,
    redirect_uri: callbackUrl(origin, 'discord'),
    grant_type: 'authorization_code',
  });
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!tokenRes.ok) throw new Error('failed');
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) throw new Error('failed');
  const profileRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!profileRes.ok) throw new Error('failed');
  const profile = (await profileRes.json()) as {
    id?: string;
    email?: string;
    username?: string;
    global_name?: string;
    avatar?: string;
  };
  if (!profile.id) throw new Error('failed');
  if (!profile.email) throw new Error('email');
  const avatar = profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : '';
  return {
    id: profile.id,
    email: profile.email.toLowerCase().trim(),
    name: profile.global_name || profile.username || '',
    avatar,
  };
}

export async function fetchSocialProfile(settings: OAuthSettings, provider: SocialProvider, origin: string, code: string) {
  return provider === 'google' ? googleProfile(settings, origin, code) : discordProfile(settings, origin, code);
}

async function uniqueUsername(seed: string) {
  const base = seed.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 16) || 'player';
  for (let i = 0; i < 6; i += 1) {
    const name = i === 0 ? base : `${base}${crypto.randomInt(1000, 9999)}`;
    const exists = await User.exists({ username: name });
    if (!exists) return name;
  }
  return `player${crypto.randomInt(100000, 999999)}`;
}

export async function findOrCreateSocialUser(provider: SocialProvider, profile: Profile) {
  const idField = provider === 'google' ? 'googleId' : 'discordId';
  const linked = await User.findOne({ [idField]: profile.id });
  if (linked) {
    if (linked.emailVerified && !linked.status) throw new Error('disabled');
    return linked;
  }

  const byEmail = await User.findOne({ email: profile.email });
  if (byEmail) {
    if (byEmail.emailVerified && !byEmail.status) throw new Error('disabled');
    const current = String(byEmail.get(idField) || '');
    if (current && current !== profile.id) throw new Error('linked');
    if (!current) byEmail.set(idField, profile.id);
    if (!byEmail.emailVerified) {
      byEmail.emailVerified = true;
      byEmail.status = true;
    }
    if (!byEmail.avatar && profile.avatar.startsWith('https://')) byEmail.avatar = profile.avatar;
    await byEmail.save();
    return byEmail;
  }

  const username = await uniqueUsername(profile.name || profile.email.split('@')[0] || 'player');
  const password = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
  const playerRole = await Role.findOne({ type: 'player', name: 'Player' });
  return User.create({
    email: profile.email,
    username,
    displayName: profile.name.slice(0, 40),
    password,
    status: true,
    emailVerified: true,
    avatar: profile.avatar.startsWith('https://') ? profile.avatar : '',
    referralCode: generateReferralCode(username),
    roleRef: playerRole?._id ?? null,
    role: { type: 'player', name: 'Player', permissions: [] },
    [idField]: profile.id,
  });
}
