import * as React from "react"
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const timezones = [
  { value: "Atlantic/Azores", label: "Azores Standard Time (GMT-01:00)" },
  { value: "Atlantic/Cape_Verde", label: "Cape Verde Standard Time (GMT-01:00)" },
  { value: "Atlantic/South_Georgia", label: "Mid-Atlantic Standard Time (GMT-02:00)" },
  { value: "America/Sao_Paulo", label: "E. South America Standard Time (GMT-03:00)" },
  { value: "America/Argentina/Buenos_Aires", label: "SA Eastern Standard Time (GMT-03:00)" },
  { value: "America/Godthab", label: "Greenland Standard Time (GMT-03:00)" },
  { value: "America/St_Johns", label: "Newfoundland Standard Time (GMT-03:30)" },
  { value: "America/Halifax", label: "Atlantic Standard Time (GMT-04:00)" },
  { value: "America/La_Paz", label: "SA Western Standard Time (GMT-04:00)" },
  { value: "America/Cuiaba", label: "Central Brazilian Standard Time (GMT-04:00)" },
  { value: "America/Santiago", label: "Pacific SA Standard Time (GMT-04:00)" },
  { value: "America/Bogota", label: "SA Pacific Standard Time (GMT-05:00)" },
  { value: "America/New_York", label: "Eastern Standard Time (GMT-05:00)" },
  { value: "America/Indiana/Indianapolis", label: "US Eastern Standard Time (GMT-05:00)" },
  { value: "America/Costa_Rica", label: "Central America Standard Time (GMT-06:00)" },
  { value: "America/Chicago", label: "Central Standard Time (GMT-06:00)" },
  { value: "America/Monterrey", label: "Central Standard Time (Mexico) (GMT-06:00)" },
  { value: "America/Edmonton", label: "Canada Central Standard Time (GMT-06:00)" },
  { value: "America/Phoenix", label: "US Mountain Standard Time (GMT-07:00)" },
  { value: "America/Chihuahua", label: "Mountain Standard Time (Mexico) (GMT-07:00)" },
  { value: "America/Denver", label: "Mountain Standard Time (GMT-07:00)" },
  { value: "America/Tijuana", label: "Pacific Standard Time (GMT-08:00)" },
  { value: "America/Anchorage", label: "Alaskan Standard Time (GMT-09:00)" },
  { value: "Pacific/Honolulu", label: "Hawaiian Standard Time (GMT-10:00)" },
  { value: "Pacific/Apia", label: "Samoa Standard Time (GMT-11:00)" },
  { value: "Africa/Monrovia", label: "Greenwich Standard Time (GMT)" },
  { value: "Europe/London", label: "GMT Standard Time (GMT)" },
  { value: "Europe/Berlin", label: "W. Europe Standard Time (GMT+01:00)" },
  { value: "Europe/Belgrade", label: "Central Europe Standard Time (GMT+01:00)" },
  { value: "Europe/Paris", label: "Romance Standard Time (GMT+01:00)" },
  { value: "Africa/Lagos", label: "W. Central Africa Standard Time (GMT+01:00)" },
  { value: "Europe/Istanbul", label: "GTB Standard Time (GMT+02:00)" },
  { value: "Africa/Cairo", label: "Egypt Standard Time (GMT+02:00)" },
  { value: "Africa/Harare", label: "South Africa Standard Time (GMT+02:00)" },
  { value: "Europe/Riga", label: "FLE Standard Time (GMT+02:00)" },
  { value: "Asia/Jerusalem", label: "Israel Standard Time (GMT+02:00)" },
  { value: "Europe/Minsk", label: "E. Europe Standard Time (GMT+02:00)" },
  { value: "Africa/Windhoek", label: "Namibia Standard Time (GMT+02:00)" },
  { value: "Asia/Baghdad", label: "Arabic Standard Time (GMT+03:00)" },
  { value: "Asia/Kuwait", label: "Arab Standard Time (GMT+03:00)" },
  { value: "Europe/Moscow", label: "Russian Standard Time (GMT+03:00)" },
  { value: "Africa/Nairobi", label: "E. Africa Standard Time (GMT+03:00)" },
  { value: "Asia/Tehran", label: "Iran Standard Time (GMT+03:30)" },
  { value: "Asia/Muscat", label: "Arabian Standard Time (GMT+04:00)" },
  { value: "Asia/Baku", label: "Azerbaijan Standard Time (GMT+04:00)" },
  { value: "Asia/Tbilisi", label: "Georgian Standard Time (GMT+04:00)" },
  { value: "Asia/Yerevan", label: "Caucasus Standard Time (GMT+04:00)" },
  { value: "Asia/Kabul", label: "Afghanistan Standard Time (GMT+04:30)" },
  { value: "Asia/Yekaterinburg", label: "Ekaterinburg Standard Time (GMT+05:00)" },
  { value: "Asia/Tashkent", label: "West Asia Standard Time (GMT+05:00)" },
  { value: "Asia/Calcutta", label: "India Standard Time (GMT+05:30)" },
  { value: "Asia/Kathmandu", label: "Nepal Standard Time (GMT+05:45)" },
  { value: "Asia/Novosibirsk", label: "N. Central Asia Standard Time (GMT+06:00)" },
  { value: "Asia/Almaty", label: "Central Asia Standard Time (GMT+06:00)" },
  { value: "Asia/Colombo", label: "Sri Lanka Standard Time (GMT+06:00)" },
  { value: "Asia/Rangoon", label: "Myanmar Standard Time (GMT+06:30)" },
  { value: "Asia/Bangkok", label: "SE Asia Standard Time (GMT+07:00)" },
  { value: "Asia/Krasnoyarsk", label: "North Asia Standard Time (GMT+07:00)" },
  { value: "Asia/Shanghai", label: "China Standard Time (GMT+08:00)" },
  { value: "Asia/Irkutsk", label: "North Asia East Standard Time (GMT+08:00)" },
  { value: "Asia/Singapore", label: "Singapore Standard Time (GMT+08:00)" },
  { value: "Australia/Perth", label: "W. Australia Standard Time (GMT+08:00)" },
  { value: "Asia/Taipei", label: "Taipei Standard Time (GMT+08:00)" },
  { value: "Asia/Tokyo", label: "Tokyo Standard Time (GMT+09:00)" },
  { value: "Asia/Seoul", label: "Korea Standard Time (GMT+09:00)" },
  { value: "Asia/Yakutsk", label: "Yakutsk Standard Time (GMT+09:00)" },
  { value: "Australia/Adelaide", label: "Cen. Australia Standard Time (GMT+09:30)" },
  { value: "Australia/Darwin", label: "AUS Central Standard Time (GMT+09:30)" },
  { value: "Australia/Brisbane", label: "E. Australia Standard Time (GMT+10:00)" },
  { value: "Australia/Sydney", label: "AUS Eastern Standard Time (GMT+10:00)" },
  { value: "Pacific/Guam", label: "West Pacific Standard Time (GMT+10:00)" },
  { value: "Australia/Hobart", label: "Tasmania Standard Time (GMT+10:00)" },
  { value: "Asia/Vladivostok", label: "Vladivostok Standard Time (GMT+10:00)" },
  { value: "Pacific/Guadalcanal", label: "Central Pacific Standard Time (GMT+11:00)" },
  { value: "Pacific/Auckland", label: "New Zealand Standard Time (GMT+12:00)" },
  { value: "Pacific/Fiji", label: "Fiji Standard Time (GMT+12:00)" },
  { value: "Pacific/Tongatapu", label: "Tonga Standard Time (GMT+13:00)" },
]

interface TimezoneSelectProps {
  value: string | undefined | null;
  onChange: (value: string) => void;
}

export function TimezoneSelect({ value, onChange }: TimezoneSelectProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value && timezones.find((timezone) => timezone.value === value)
            ? timezones.find((timezone) => timezone.value === value)?.label
            : "Select timezone..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search timezone..." />
          <CommandEmpty>No timezone found.</CommandEmpty>
          <CommandList>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {timezones.map((timezone) => (
              <CommandItem
                key={timezone.value}
                onSelect={() => {
                  onChange(timezone.value)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value && timezone.value === value ? "opacity-100" : "opacity-0"
                  )}
                />
                {timezone.label}
              </CommandItem>
            ))}
          </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

