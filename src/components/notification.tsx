// components/notification.tsx

export default function Notification({ message, type }: { message: string; type: 'success' | 'error' }) {
  const bgColor = type === 'success' ? 'bg-green-600 border-green-200' : 'bg-red-600 border-red-200';

  return (
    <div className="container mx-auto">
      <div className={`flex justify-center mx-auto border text-white w-1/2 text-center text-md my-4 py-2 ${bgColor}`}>
        <h1 className="text-lg font-semibold">{message}</h1>
      </div>
    </div>
  );
}
