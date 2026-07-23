"use client"

import { AppSidebarLogo } from "@/components/app-sidebar-logo"
import pathsConfig from "@/config/paths.config"
import { School, SchoolMemberRole } from "@/lib/kinder/types"
import { Button } from "@kit/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@kit/ui/tooltip"
import { cn } from "@kit/ui/utils"
import { Building, CircleDollarSign, CircleQuestionMark, House, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { Trans } from "react-i18next"

interface AppModuleProps {
    school: School
}
export function AppModule({ school }: AppModuleProps) {
    const router = useRouter()
    const navTop = [
        {
            id: 'home',
            icon: <House className="size-5" />,
            name: <Trans i18nKey={'marketing:home'} />,
            href: '/',
        },
        {
            id: 'pricing',
            icon: <CircleDollarSign className="size-5" />,
            name: <Trans i18nKey={'marketing:pricing'} />,
            href: '/pricing',
        },
        {
            id: 'faq',
            icon: <CircleQuestionMark className="size-5" />,
            name: <Trans i18nKey={'marketing:faq'} />,
            href: '/faq',
        },
    ]

    const navBottom = [
        {
            id: 'account',
            icon: <User className="size-5" />,
            name: <Trans i18nKey={'common:routes.account'} />,
            href: pathsConfig.app.account,
        },
        {
            id: "school",
            icon: <Building className="size-5" />,
            name:<Trans i18nKey={'common:routes.school'} />,
            href: pathsConfig.app.settingsSchool,
        }
    ]
    return (
        <div className={cn("h-full w-[50px] lg:w-[70px] bg-primary py-2 px-1 lg:p-2")} 
        >
            <div className="rounded-sm flex items-center justify-center p-1 bg-white">
                <AppSidebarLogo school={school} onlyIcon href={pathsConfig.app.home} />
            </div>
            <div className="relative flex-1 text-center py-4 h-[calc(100%-50px)]">
                <div className="flex flex-col justify-between h-full">
                    <div className="space-y-4">
                    {navTop.map(item => (
                    <TooltipProvider delayDuration={0}  key={item.id}>
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

                <div className="space-y-4">
                {navBottom.map(item => (
                    <TooltipProvider delayDuration={0}  key={item.id}>
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
            </div>
        </div>
    )
}