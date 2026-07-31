import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { ArrowLeft } from 'lucide-react';

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button variant="secondary" size="sm" className="p-2 mr-4" onClick={() => navigate(-1)} title="Voltar">
      <ArrowLeft className="w-4 h-4" />
    </Button>
  );
};
