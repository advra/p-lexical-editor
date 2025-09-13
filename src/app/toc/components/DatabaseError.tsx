'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export const DatabaseError = () => {
  return (
    <>
      <Card variant="outlined">
        <CardContent>
          <h1>Configuration error</h1>
          <p>Missing DB_JSON_PATH environment variable.</p>
        </CardContent>
      </Card>
    </>
  )
}
