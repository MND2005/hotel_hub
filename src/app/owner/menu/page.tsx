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
    breakfast: [],
    lunch: [],
    dinner: [],
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
                        <TableCell className="text-right">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Delete</Button>
                        </TableCell>
                    </TableRow>
                ))
            )}
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
