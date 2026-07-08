import { AuthShell } from '../auth/_components/auth-shell';

function UpdatePasswordLayout({ children }: React.PropsWithChildren) {
  return <AuthShell>{children}</AuthShell>;
}

export default UpdatePasswordLayout;
