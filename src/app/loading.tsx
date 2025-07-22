import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Image
        src="/lambang 1.png"
        alt="Lambang"
        width={200}
        height={200}
        className="blink-image"
      />
    </div>
  );
}
