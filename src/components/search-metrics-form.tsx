"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search, LinkIcon, User, Loader2, Upload } from 'lucide-react'
import { useState, useCallback, useMemo } from "react"
import { useRouter } from 'next/navigation'
import { useMetrics } from "@/context/metrics-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { analyzeMetrics } from "@/lib/api"
import Papa from 'papaparse'

// Rest of your working code stays exactly the same, just remove these lines:

// Remove these 3 lines:
// const renderRef = useRef(0)
// renderRef.current++
// useEffect(() => {
//   console.log(`SearchMetricsForm Render #${renderRef.current}`)
// })

// Everything else stays identical