
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelPage() {
    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto bg-red-100 rounded-full h-16 w-16 flex items-center justify-center">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <CardTitle className="mt-4">Payment Cancelled</CardTitle>
                    <CardDescription>
                        Your payment was not completed. Your cart has been saved, so you can try again anytime.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="mt-6 flex justify-center gap-4">
                        <Button asChild variant="outline">
                            <Link href="/customer">Back to Browsing</Link>
                        </Button>
                   </div>
                </CardContent>
            </Card>
        </div>
    )
}
