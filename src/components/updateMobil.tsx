// src/components/updateMobil.tsx
import EditMobilForm from './editMobilForm';
import { MobilType } from "@/types/mobil";

interface UpdateMobilProps {
  data: MobilType;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UpdateMobil({ data, onSuccess, onCancel }: UpdateMobilProps) {
  return (
    <EditMobilForm 
      data={data} 
      onSuccess={onSuccess} 
      onCancel={onCancel} 
    />
  );
}