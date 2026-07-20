const fs = require('fs');
let content = fs.readFileSync('src/pages/DetalheOrdem.tsx', 'utf8');

content = content.replace(/import \{ WorkOrder, Unit, Location, Category, User, Asset, WorkOrderStatus, Provider \} from "\.\.\/types";/, 
'import { WorkOrder, Unit, Location, Category, User, Asset, WorkOrderStatus, Provider, OSMaterial, StockMaterial } from "../types";');

fs.writeFileSync('src/pages/DetalheOrdem.tsx', content);
