// app/verify-info/page.tsx
export default function VerifyInfoPage() {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-6 rounded shadow max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-black">Verify Your Email</h1>
          <p className="text-black">
            We’ve sent a verification link to your email address. Please check your inbox
            and verify your account before logging in.
          </p>
        </div>
      </div>
    );
  }
  