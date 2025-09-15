import Navbar from "@/components/common/Navbar/Navbar"
import TocClient, { Link } from "..//ClientToc";

type Props = {
  links: Link[]
}

export const TocView = ({ links }: Props) => {
  return (
    <>
      <Navbar />
      <TocClient links={links} />
    </>
  )
}
