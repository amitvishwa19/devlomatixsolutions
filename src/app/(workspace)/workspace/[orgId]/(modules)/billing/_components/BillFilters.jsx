import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

const departments = [
  "All Departments",
  "General Medicine",
  "Cardiology",
  "Orthopedics",
  "Neurology",
  "Pathology",
  "Radiology",
  "ENT",
  "Ophthalmology",
  "Pediatrics",
  "Gynecology",
];

const statuses = [
  { value: "all", label: "All Status" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

const BillFilters = ({ onFilterChange, activeFilters }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value) => {
    setSearchTerm(value);
    onFilterChange?.({ search: value, department, status, dateRange });
  };

  const handleDepartmentChange = (value) => {
    setDepartment(value);
    onFilterChange?.({ search: searchTerm, department: value, status, dateRange });
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    onFilterChange?.({ search: searchTerm, department, status: value, dateRange });
  };

  const handleDateChange = (date) => {
    setDateRange(date);
    onFilterChange?.({ search: searchTerm, department, status, dateRange: date });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDepartment("All Departments");
    setStatus("all");
    setDateRange(null);
    onFilterChange?.({ search: "", department: "All Departments", status: "all", dateRange: null });
  };

  const activeCount = [
    searchTerm,
    department !== "All Departments" ? department : null,
    status !== "all" ? status : null,
    dateRange,
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Main Search & Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name, ID, or bill number..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-10 bg-background"
          />
        </div>
        <Button
          variant={showFilters ? "secondary" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 shrink-0"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-xl animate-fade-in">
          {/* Department Filter */}
          <Select value={department} onValueChange={handleDepartmentChange}>
            <SelectTrigger className="w-[180px] h-10 bg-background">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[150px] h-10 bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              {statuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] h-10 justify-start gap-2 bg-background">
                <Calendar className="h-4 w-4" />
                {dateRange ? format(dateRange, "PPP") : "Select Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover border border-border z-50" align="start">
              <CalendarComponent
                mode="single"
                selected={dateRange}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Clear Filters */}
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Active Filter Tags */}
      {activeCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Search: {searchTerm}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleSearch("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {department !== "All Departments" && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {department}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleDepartmentChange("All Departments")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {status !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1 capitalize">
              {status}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleStatusChange("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default BillFilters;
