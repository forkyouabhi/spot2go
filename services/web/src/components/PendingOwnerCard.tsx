// services/web/src/components/PendingOwnerCard.tsx
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { User as UserIcon, Calendar, Check, X, Mail, Phone, MapPin } from 'lucide-react';

interface PendingOwnerCardProps {
  owner: Partial<User>;
  onApprove: () => void;
  onReject: () => void;
}

export function PendingOwnerCard({ owner, onApprove, onReject }: PendingOwnerCardProps) {
  return (
    <Card className="w-full shadow-lg overflow-hidden border-2 border-brand-yellow bg-white transition-shadow hover:shadow-xl">
      <CardHeader className="bg-brand-cream border-b-2 border-brand-yellow p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-brand-burgundy flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-brand-orange" />
              {owner.name || 'No Name Provided'}
            </CardTitle>
            <CardDescription className="text-xs text-brand-orange flex items-center gap-2 pt-1">
              <Mail className="h-4 w-4" /> {owner.email || 'No Email'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs text-brand-burgundy font-medium">
            <Calendar className="h-4 w-4" />
            <span>Submitted: {new Date(owner.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      </CardHeader>
      
      {/* --- NEW: Display extra info --- */}
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-brand-burgundy">
          <Phone className="h-4 w-4 text-brand-orange" />
          <strong>Phone:</strong>
          <span>{owner.phone || 'Not Provided'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-brand-burgundy">
          <MapPin className="h-4 w-4 text-brand-orange" />
          <strong>Address:</strong>
          <span>{owner.businessLocation || 'Not Provided'}</span>
        </div>
      </CardContent>
      {/* --- END NEW --- */}

      <CardFooter className="bg-brand-cream border-t-2 border-brand-yellow p-4 flex justify-end gap-2">
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={onReject}>
          <X className="h-4 w-4 mr-2" />
          Reject
        </Button>
        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={onApprove}>
          <Check className="h-4 w-4 mr-2" />
          Approve
        </Button>
      </CardFooter>
    </Card>
  );
}