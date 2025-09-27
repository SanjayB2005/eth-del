interface StepProps {
  number: number;
  title: string;
  description: string;
  gradient: string;
}

export default function ProcessStep({ number, title, description, gradient }: StepProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className={`w-16 h-16 ${gradient} rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
        {number}
      </div>
      <div className="flex-1 text-center md:text-left">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 text-lg">{description}</p>
      </div>
    </div>
  );
}