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
import { PlusCircle } from "lucide-react";

const menuItems = {
    breakfast: [
        { id: 1, name: "Classic Pancakes", price: 12.50 },
        { id: 2, name: "Avocado Toast", price: 14.00 },
        { id: 3, name: "Sunrise Omelette", price: 13.75 },
    ],
    lunch: [
        { id: 4, name: "Caesar Salad", price: 15.00 },
        { id: 5, name: "Club Sandwich", price: 16.50 },
        { id: 6, name: "Tomato Soup", price: 9.00 },
    ],
    dinner: [
        { id: 7, name: "Grilled Salmon", price: 28.00 },
        { id: 8, name: "Filet Mignon", price: 45.00 },
        { id: 9, name: "Mushroom Risotto", price: 22.50 },
    ],
};

const MenuTable = ({ items }: { items: { id: number, name: string, price: number }[] }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {items.map(item => (
                <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Delete</Button>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
)

export default function MenuPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Menu Management</CardTitle>
                <CardDescription>
                Add, edit, or remove food items for breakfast, lunch, and dinner.
                </CardDescription>
            </div>
            <Button>
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
            <MenuTable items={menuItems.breakfast} />
          </TabsContent>
          <TabsContent value="lunch">
            <MenuTable items={menuItems.lunch} />
          </TabsContent>
          <TabsContent value="dinner">
            <MenuTable items={menuItems.dinner} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
