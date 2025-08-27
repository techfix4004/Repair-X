import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Redirect to customer login as default
  redirect('/auth/customer/login');
}