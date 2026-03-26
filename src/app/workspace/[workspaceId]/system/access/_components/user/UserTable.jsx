import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { MoreHorizontal, Edit, Trash2, Mail } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';



export function UserTable({ users, roles, onRoleChange, onEdit, onDelete }) {
    const getRole = (roleId) => roles.find((r) => r.id === roleId);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge variant="success">Active</Badge>;
            case 'inactive':
                return <Badge variant="muted">Inactive</Badge>;
            case 'pending':
                return <Badge variant="warning">Pending</Badge>;
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[300px]">User</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => {
                        const role = getRole(user.role);
                        return (
                            <TableRow key={user?.id} className="group">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback
                                                className="text-sm font-medium"
                                                style={{ backgroundColor: role?.color + '20', color: role?.color }}
                                            >
                                                <span className='text-sm'>{getInitials(user?.displayName)}</span>
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-card-foreground">{user.displayName}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{user?.department}</TableCell>
                                <TableCell>
                                    <Select value={user.role} onValueChange={(value) => onRoleChange(user.id, value)}>
                                        <SelectTrigger className="w-[160px] h-8">
                                            <SelectValue>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-2.5 w-2.5 rounded-full"
                                                        style={{ backgroundColor: role?.color }}
                                                    />
                                                    {role?.name}
                                                </div>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((r) => (
                                                <SelectItem key={r.id} value={r.id}>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-2.5 w-2.5 rounded-full"
                                                            style={{ backgroundColor: r.color }}
                                                        />
                                                        {r.title}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>{getStatusBadge(user.status)}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {formatDistanceToNow(user.updatedAt, { addSuffix: true })}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEdit(user)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit User
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Send Email
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete(user)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
