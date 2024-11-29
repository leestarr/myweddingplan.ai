import { UsersIcon, CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export default function GuestStats({ guests }) {
  const totalGuests = guests.length;
  const confirmedGuests = guests.filter(guest => guest.status === 'Confirmed').length;
  const declinedGuests = guests.filter(guest => guest.status === 'Declined').length;
  const pendingGuests = guests.filter(guest => guest.status === 'Pending').length;
  const plusOnes = guests.filter(guest => guest.plusOne).length;

  const stats = [
    {
      name: 'Total Guests',
      value: totalGuests,
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Confirmed',
      value: confirmedGuests,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Declined',
      value: declinedGuests,
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      name: 'Pending',
      value: pendingGuests,
      icon: QuestionMarkCircleIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4"
        >
          <div className={`${stat.bgColor} p-3 rounded-lg`}>
            <stat.icon className={`h-6 w-6 ${stat.color}`} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
