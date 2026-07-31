const fs = require('fs');
let content = fs.readFileSync('src/pages/DetalheOrdem.tsx', 'utf8');

// Add import
if (!content.includes('StockMaterial')) {
    content = content.replace(/import \{ WorkOrder, OSMaterial, /, 'import { WorkOrder, OSMaterial, StockMaterial, ');
}

// Add state
if (!content.includes('const [stockMaterials, setStockMaterials]')) {
    content = content.replace(/const \[assets, setAssets\] = useState<Asset\[\]>\(\[\]\);/, 
        'const [assets, setAssets] = useState<Asset[]>([]);\n  const [stockMaterials, setStockMaterials] = useState<StockMaterial[]>([]);');
}

// Add to useEffect
content = content.replace(/setProviders\(storageService\.get\("gsi_providers"\)/, 
    'setStockMaterials(storageService.get("gsi_stock_materials"));\n    setProviders(storageService.get("gsi_providers")');

// Add material formulation state
const matForm = `
  const [addingMaterial, setAddingMaterial] = useState(false);
  const [matMode, setMatMode] = useState<"base" | "unregistered">("base");
  const [selectedStockMatId, setSelectedStockMatId] = useState("");
  const [matClass, setMatClass] = useState<any>("Obrigatório");
  const [matQuantity, setMatQuantity] = useState(1);
  const [matJustification, setMatJustification] = useState("");
  const [matDescUnreg, setMatDescUnreg] = useState("");
`;

if (!content.includes('addingMaterial')) {
    content = content.replace(/const \[newMaterial, setNewMaterial\] = useState/, matForm + '\n  const [newMaterial, setNewMaterial] = useState');
}

fs.writeFileSync('src/pages/DetalheOrdem.tsx', content);
