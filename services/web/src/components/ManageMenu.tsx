import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { addMenuItem } from '../lib/api';
import { StudyPlace, MenuItem } from '../types';
import { Coffee, DollarSign, PlusCircle, Loader2 } from 'lucide-react';

interface ManageMenuProps {
  place: StudyPlace;
  onMenuItemAdded: (newItem: MenuItem) => void;
}

export function ManageMenu({ place, onMenuItemAdded }: ManageMenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(place.menuItems || []);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    
    setIsSubmitting(true);
    try {
      const response = await addMenuItem(place.id as string, { name: newItemName, price: parseFloat(newItemPrice) });
      const newItem = response.data.item;
      setMenuItems(prev => [...prev, newItem]);
      onMenuItemAdded(newItem);
      toast.success(`'${newItemName}' added to menu!`);
      setNewItemName('');
      setNewItemPrice('');
    } catch (error) {
      toast.error('Failed to add menu item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 pt-4">
      <Card className="bg-white border-brand-yellow">
        <CardHeader>
          <CardTitle className="text-xl text-brand-burgundy">Current Menu</CardTitle>
        </CardHeader>
        <CardContent>
          {menuItems.length > 0 ? (
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {menuItems.map(item => (
                <li key={item.id} className="flex justify-between items-center p-3 bg-brand-cream rounded-lg border border-brand-orange">
                  <span className="font-medium text-brand-burgundy">{item.name}</span>
                  <span className="font-semibold text-brand-orange">
                    ${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-brand-orange py-8">No menu items added yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white border-brand-yellow">
        <CardHeader>
          <CardTitle className="text-xl text-brand-burgundy">Add New Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddMenuItem} className="space-y-4">
            <div>
              <Label htmlFor="itemName" className="text-brand-burgundy">Item Name</Label>
              <div className="relative mt-1">
                <Coffee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-orange" />
                <Input
                  id="itemName"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g., Espresso"
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="itemPrice" className="text-brand-burgundy">Price</Label>
               <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-orange" />
                <Input
                  id="itemPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="e.g., 3.50"
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full bg-brand-orange hover:bg-brand-orange/90 text-brand-cream">
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlusCircle className="h-5 w-5 mr-2" />}
              Add to Menu
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}