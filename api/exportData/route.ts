// file: api/exportData/route.ts
import { NextApiRequest, NextApiResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const filePath = path.join(process.cwd(), 'data', 'ankiState.json');
      const data = await readFile(filePath, 'utf8');

      // 可选：如果你想在导出时确保日期格式的一致性，可以解析和重新格式化日期
      // const parsedData = JSON.parse(data);
      // 在这里处理日期格式化
      // const formattedData = JSON.stringify(parsedData);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=anki_app_data.json');
      res.status(200).send(data); // 或者发送 formattedData，如果你选择重新格式化
    } catch (error) {
      res.status(500).json({ message: 'Error exporting data', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
