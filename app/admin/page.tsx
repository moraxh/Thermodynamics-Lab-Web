import Link from 'next/link';
import { Users, Image, FileText, Video, BookOpen, GraduationCap, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const sections = [
  {
    title: 'Members',
    description: 'Manage team members',
    href: '/admin/members',
    icon: Users,
  },
  {
    title: 'Gallery',
    description: 'Manage image gallery',
    href: '/admin/gallery',
    icon: Image,
  },
  {
    title: 'Publications',
    description: 'Manage publications',
    href: '/admin/publications',
    icon: FileText,
  },
  {
    title: 'Videos',
    description: 'Manage video content',
    href: '/admin/videos',
    icon: Video,
  },
  {
    title: 'Articles',
    description: 'Manage articles',
    href: '/admin/articles',
    icon: BookOpen,
  },
  {
    title: 'Educational Material',
    description: 'Manage educational resources',
    href: '/admin/educational-material',
    icon: GraduationCap,
  },
  {
    title: 'Events',
    description: 'Manage events',
    href: '/admin/events',
    icon: Calendar,
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-lab-white mb-2">Dashboard</h2>
        <p className="text-lab-gray-400">Select a section to manage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="bg-lab-gray-100 border-lab-white/10 hover:border-lab-blue/50 transition-colors cursor-pointer group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-lab-blue/10 flex items-center justify-center mb-4 group-hover:bg-lab-blue/20 transition-colors">
                    <Icon className="w-6 h-6 text-lab-blue" />
                  </div>
                  <CardTitle className="text-lab-white">{section.title}</CardTitle>
                  <CardDescription className="text-lab-gray-400">
                    {section.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
