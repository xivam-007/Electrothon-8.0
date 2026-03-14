export interface Orders{
    id: number;
    status: "pending" | "initiated" | "intransit" |"delivered" | "cancelled";
    size: string;
    weight: number;
    pickupLocation: string;
    dropoffLocation: string;
    pickupDate: string;
    pickupTime: string;
    deliveryDate: string;
    deliveryTime: string;
}

export const dummyOrders: Orders[] = [
    {
        id: 1,
        status: "initiated",
        size: "Medium",
        weight: 5,
        pickupLocation: "123 Main St, City A",
        dropoffLocation: "456 Elm St, City B",
        pickupDate: "2024-07-01",
        pickupTime: "10:00 AM",
        deliveryDate: "2024-07-02",
        deliveryTime: "2:00 PM"
    },
    {
        id: 2,
        status: "intransit",
        size: "Large",
        weight: 10,
        pickupLocation: "789 Oak St, City C",
        dropoffLocation: "321 Pine St, City D",
        pickupDate: "2024-07-03",
        pickupTime: "11:00 AM",
        deliveryDate: "2024-07-04",
        deliveryTime: "3:00 PM"
    },
    {
        id: 3,
        status: "delivered",
        size: "Small",
        weight: 2,
        pickupLocation: "555 Maple St, City E",
        dropoffLocation: "777 Cedar St, City F",
        pickupDate: "2024-07-05",
        pickupTime: "9:00 AM",
        deliveryDate: "2024-07-06",
        deliveryTime: "1:00 PM"
    },
    {
        id: 4,
        status: "cancelled",
        size: "Medium",
        weight: 4,
        pickupLocation: "888 Birch St, City G",
        dropoffLocation: "999 Spruce St, City H",
        pickupDate: "2024-07-07",
        pickupTime: "12:00 PM",
        deliveryDate: "2024-07-08",
        deliveryTime: "4:00 PM"
    }
] 