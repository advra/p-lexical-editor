import { Data } from '@measured/puck';
import fs from 'fs';
import dbConnect from './db/mongodb';
import { ProcModel } from '@/modules/procs/models/proc-model';

// Replace with call to your database
export const getPage = async (path: string) => {
  // if (!process.env.DB_JSON_PATH) {
  //   throw new Error('Missing DB_JSON_PATH environment variable');
  // }

  // const allData: Record<string, Data> | null = fs.existsSync(
  //   process.env.DB_JSON_PATH,
  // )
  //   ? JSON.parse(fs.readFileSync(process.env.DB_JSON_PATH, 'utf-8'))
  //   : null;

  // return allData ? allData[path] : null;

  await dbConnect();
  const doc = await ProcModel.findOne({ path }).lean();
  return (doc?.data as Data) ?? null;
};
