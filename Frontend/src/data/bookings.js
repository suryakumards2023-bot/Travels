const bookings = [
  {
    id: "MKT10001",
    tourId: 1,
    tourName: "Goa Beach Escape",
    destination: "Goa, India",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=85",
    bookingDate: "05 Oct 2026",
    travelDate: "20 Oct 2026",
    duration: "4N / 5D",
    travellers: 2,
    amount: 8999,
    status: "Upcoming",
    paymentStatus: "Paid",
    customer: {
      name: "Surya Kumar",
      email: "surya@example.com",
      phone: "+91 98765 43210",
    },
  },

  {
    id: "MKT10002",
    tourId: 2,
    tourName: "Manali Mountain Adventure",
    destination: "Manali, India",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=85",
    bookingDate: "12 Sep 2026",
    travelDate: "25 Sep 2026",
    duration: "5N / 6D",
    travellers: 3,
    amount: 12999,
    status: "Completed",
    paymentStatus: "Paid",
    customer: {
      name: "Surya Kumar",
      email: "surya@example.com",
      phone: "+91 98765 43210",
    },
  },

  {
    id: "MKT10003",
    tourId: 3,
    tourName: "Kashmir Paradise Tour",
    destination: "Kashmir, India",
    image:
      "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=1000&q=85",
    bookingDate: "01 Oct 2026",
    travelDate: "15 Nov 2026",
    duration: "6N / 7D",
    travellers: 2,
    amount: 14999,
    status: "Upcoming",
    paymentStatus: "Paid",
    customer: {
      name: "Surya Kumar",
      email: "surya@example.com",
      phone: "+91 98765 43210",
    },
  },

  {
    id: "MKT10004",
    tourId: 4,
    tourName: "Dubai Luxury Holiday",
    destination: "Dubai, UAE",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=85",
    bookingDate: "20 Aug 2026",
    travelDate: "10 Sep 2026",
    duration: "4N / 5D",
    travellers: 2,
    amount: 32999,
    status: "Cancelled",
    paymentStatus: "Refund Processing",
    customer: {
      name: "Surya Kumar",
      email: "surya@example.com",
      phone: "+91 98765 43210",
    },
  },
];

export default bookings;