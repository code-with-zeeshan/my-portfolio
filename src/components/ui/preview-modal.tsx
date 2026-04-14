"use client";

import React, { useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { X } from "lucide-react";

interface PreviewModalProps {
   open: boolean;
   onClose: () => void;
   title?: string;
   fullScreen?: boolean;
   children: React.ReactNode;
}

export function PreviewModal({
   open,
   onClose,
   title,
   fullScreen = false,
   children
}: PreviewModalProps) {
   useEffect(() => {
     if (open) {
       document.body.style.overflow = 'hidden';
     } else {
       document.body.style.overflow = 'unset';
     }
     return () => {
       document.body.style.overflow = 'unset';
     };
   }, [open]);
   if (fullScreen) {
     return (
       <div className="fixed inset-0 z-9999 flex flex-col bg-zinc-50 dark:bg-zinc-950">
         {children}
       </div>
     );
   } else {
     return (
       <Sheet open={open} onOpenChange={onClose}>
         <SheetContent className="w-full max-w-4xl p-0 overflow-y-auto sm:max-w-[700px] md:max-w-[900px]" side="right">
           <div className="relative min-h-full">
             <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4">
               <SheetHeader className="p-0">
                 <SheetTitle className="text-xl font-semibold">
                   {title}
                 </SheetTitle>
               </SheetHeader>
               <SheetClose className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                 <X className="h-5 w-5" />
                 <span className="sr-only">Close</span>
               </SheetClose>
             </div>
             <div className="p-6">
               {children}
             </div>
           </div>
         </SheetContent>
       </Sheet>
     );
   }
}

export default PreviewModal;
