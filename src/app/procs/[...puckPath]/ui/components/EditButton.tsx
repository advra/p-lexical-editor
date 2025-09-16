'use client';

import Button from "@mui/material/Button";
import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from "next/navigation"

type Props = {
  path: string;
}

export const EditButton = ({ path }: Props) => {
  const router = useRouter()
  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<EditIcon />}
        aria-label="Edit"
        onClick={() => {
          router.push(`${path}/edit`)
        }}>
        Edit
      </Button>
    </>
  )
}
