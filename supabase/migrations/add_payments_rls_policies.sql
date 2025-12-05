-- Enable RLS on payments table (if not already enabled)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to insert their own payment records
CREATE POLICY "Users can insert their own payments"
ON payments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = guest_id);

-- Policy: Allow users to read their own payments
CREATE POLICY "Users can view their own payments"
ON payments
FOR SELECT
TO authenticated
USING (auth.uid() = guest_id);

-- Policy: Allow users to update their own payments
CREATE POLICY "Users can update their own payments"
ON payments
FOR UPDATE
TO authenticated
USING (auth.uid() = guest_id)
WITH CHECK (auth.uid() = guest_id);

-- Policy: Allow hosts to view payments for their properties
CREATE POLICY "Hosts can view payments for their properties"
ON payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN properties p ON b.property_id = p.id
    WHERE b.id = payments.booking_id
    AND p.host_id = auth.uid()
  )
);
