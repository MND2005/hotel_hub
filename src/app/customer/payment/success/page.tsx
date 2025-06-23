
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="mt-4">Payment Successful!</CardTitle>
                    <CardDescription>
                        Thank you for your order. We've received your payment and your booking/order is being processed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-muted-foreground">You will receive a confirmation email shortly. You can view your order details in your profile.</p>
                   <div className="mt-6 flex justify-center gap-4">
                        <Button asChild>
                            <Link href="/customer/orders">View My Orders</Link>
                        </Button>
                         <Button asChild variant="outline">
                            <Link href="/customer">Continue Browsing</Link>
                        </Button>
                   </div>
                </CardContent>
            </Card>
        </div>
    )
}
