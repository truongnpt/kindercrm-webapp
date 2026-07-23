"use client"

import { AppSidebarLogo } from "@/components/app-sidebar-logo"
import pathsConfig from "@/config/paths.config"
import { School, SchoolMemberRole } from "@/lib/kinder/types"
import { Button } from "@kit/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@kit/ui/tooltip"
import { cn } from "@kit/ui/utils"
import { Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface AppModuleProps {
    school: School
}
export function AppModule({ school }: AppModuleProps) {
    const router = useRouter()
    const nav = [
        {
            icon: <User className="size-5" />,
            name: "User",
            href: pathsConfig.app.home,
        },
        {
            icon: <Settings className="size-5" />,
            name: "Setting",
            href: "/",
        }
    ]
    return (
        <div className={cn("h-full w-[50px] lg:w-[70px] bg-primary py-2 px-1 lg:p-2")} 
        >
            <div className="rounded-sm flex items-center justify-center p-1 bg-white">
                <AppSidebarLogo school={school} onlyIcon href={pathsConfig.app.home} />
            </div>
            <div className="flex-1 py-4 text-center">
                {nav.map(item => (
                    <TooltipProvider delayDuration={0}  key={item.name}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-10 h-10 rounded-sm text-white cursor-pointer"
                                    onClick={() => router.push(item.href)}
                                >
                                    {item.icon}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={16} className="w-fit">
                                <p className="p-1 text-sm">{item.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
        </div>
    )
}