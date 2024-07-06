// file: api/importData/route.ts
import { NextApiRequest, NextApiResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const data = JSON.stringify(req.body);
      const filePath = path.join(process.cwd(), 'data', 'ankiState.json');
      await writeFile(filePath, data);
      res.status(200).json({ message: 'State saved successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error saving state', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
