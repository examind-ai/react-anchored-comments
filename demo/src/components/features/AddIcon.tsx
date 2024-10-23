import { MessageSquarePlus } from 'lucide-react';

const AddIcon = () => {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100">
      <MessageSquarePlus className="h-8 w-8 text-blue-600" />
    </span>
  );
};

export default AddIcon;
