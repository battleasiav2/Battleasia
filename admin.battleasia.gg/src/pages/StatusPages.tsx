export function ForbiddenPage() {
  return (
    <main className="admin-body">
      <h1>403</h1>
      <p className="admin-lead">This section is hidden by RBAC. Admins bypass permission checks.</p>
    </main>
  );
}

export function NotFoundPage() {
  return (
    <main className="admin-body">
      <h1>404</h1>
      <p className="admin-lead">Unknown admin section.</p>
    </main>
  );
}
