import { RegisterForm } from '@/components/auth/AuthForms';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-4">RepairX</div>
          <h1 className="text-2xl font-bold text-gray-900">Join RepairX Today</h1>
          <p className="text-gray-600 mt-2">Create your account and start managing repairs</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}