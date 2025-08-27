import { redirect } from 'next/navigation';

export default function RegisterPage() {
  // No public registration - redirect to customer login with info
  redirect('/auth/customer/login');
}