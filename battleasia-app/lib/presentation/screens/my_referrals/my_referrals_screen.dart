import 'package:flutter/material.dart';
import 'package:battleasia_app/presentation/screens/referral/referral_screen.dart';

/// My Referrals — same dashboard as Earn, without invite marketing section.
class MyReferralsScreen extends StatelessWidget {
  const MyReferralsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ReferralScreen(showInviteSection: false);
  }
}
