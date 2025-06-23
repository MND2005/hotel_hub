
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import type { MenuItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getMenuItemsByHotel, deleteMenuItem } from "@/lib/firebase/menu";
import { MenuItemFormDialog } from "@/components/owner/menu-item-form-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";


const MenuTable = ({ items, onEdit, onDelete }: { items: MenuItem[], onEdit: (item: MenuItem) => void, onDelete: (id: string) => void }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Price</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.length === 0 ? (
        <TableRow>
          <TableCell colSpan={3} className="h-24 text-center">
            No items in this category.
          </TableCell>
        </TableRow>
      ) : (
        items.map(item => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>${item.price.toFixed(2)}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this menu item.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(item.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
);

export default function HotelMenuPage() {
  const params = useParams();
  const hotelId = params.id as string;
  const { toast } = useToast();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getMenuItemsByHotel(hotelId);
      setMenuItems(items);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch menu items.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [hotelId, toast]);

  useEffect(() => {
    if (hotelId) {
      fetchMenuItems();
    }
  }, [hotelId, fetchMenuItems]);

  const handleAddItem = () => {
    setSelectedMenuItem(null);
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteMenuItem(hotelId, itemId);
      toast({
        title: "Success",
        description: "Menu item deleted.",
      });
      fetchMenuItems();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast({
        title: "Error",
        description: "Failed to delete menu item.",
        variant: "destructive",
      });
    }
  };

  const groupedItems = useMemo(() => {
    return menuItems.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, { breakfast: [], lunch: [], dinner: [] } as Record<string, MenuItem[]>);
  }, [menuItems]);
  
  if (loading) {
    return (
        <Card>
            <CardHeader>
                 <div className="flex justify-between items-start">
                    <div>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64 mt-2" />
                    </div>
                    <Skeleton className="h-10 w-36" />
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-72 mb-4" />
                <Skeleton className="h-48 w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>
                Add, edit, or remove food items for Hotel #{hotelId}.
              </CardDescription>
            </div>
            <Button onClick={handleAddItem}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="breakfast">
            <TabsList>
              <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
              <TabsTrigger value="lunch">Lunch</TabsTrigger>
              <TabsTrigger value="dinner">Dinner</TabsTrigger>
            </TabsList>
            <TabsContent value="breakfast">
              <MenuTable items={groupedItems.breakfast} onEdit={handleEditItem} onDelete={handleDeleteItem} />
            </TabsContent>
            <TabsContent value="lunch">
              <MenuTable items={groupedItems.lunch} onEdit={handleEditItem} onDelete={handleDeleteItem} />
            </TabsContent>
            <TabsContent value="dinner">
              <MenuTable items={groupedItems.dinner} onEdit={handleEditItem} onDelete={handleDeleteItem} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <MenuItemFormDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        hotelId={hotelId}
        menuItem={selectedMenuItem}
        onSave={fetchMenuItems}
      />
    </>
  );
}
