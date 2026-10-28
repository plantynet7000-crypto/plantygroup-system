import { getGateConfig,passwordPage } from '../../server/viewer-access';
export const dynamic = 'force-dynamic';
export async function GET() { return passwordPage(!!await getGateConfig()); }
