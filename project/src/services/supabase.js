
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lslnqukfyhqsjcmrwxej.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzbG5xdWtmeWhxc2pjbXJ3eGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2ODM1OTEsImV4cCI6MjA3ODI1OTU5MX0.NO0ufm7GVKos7Y5jvNNSyfcsoMENHKHf4VikRsi3kS0"
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;