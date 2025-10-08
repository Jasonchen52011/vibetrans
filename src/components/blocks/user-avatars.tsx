import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const users = [
  {
    name: 'User 1',
    image: 'https://i.pravatar.cc/150?img=1',
  },
  {
    name: 'User 2',
    image: 'https://i.pravatar.cc/150?img=2',
  },
  {
    name: 'User 3',
    image: 'https://i.pravatar.cc/150?img=3',
  },
];

export default function UserAvatars() {
  return (
    <div className="flex -space-x-2">
      {users.map((user, index) => (
        <Avatar key={index} className="border-2 border-white dark:border-gray-800">
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
