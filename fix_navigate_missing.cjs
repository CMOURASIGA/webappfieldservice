const fs = require('fs');
const files = [
  'src/pages/DetalheAtivo.tsx',
  'src/pages/DetalheLocal.tsx',
  'src/pages/FilaEstoque.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('const navigate = useNavigate();')) {
    content = content.replace(
      'const { id } = useParams();',
      'const { id } = useParams();\n  const navigate = useNavigate();'
    );
    // if FilaEstoque doesn't have useParams
    if (!content.includes('useParams()')) {
        content = content.replace(
            'const [requests, setRequests] = useState',
            'const navigate = useNavigate();\n  const [requests, setRequests] = useState'
        );
    }
    
    if (!content.includes('useNavigate')) {
        content = content.replace(
            'import { useParams } from "react-router-dom";',
            'import { useParams, useNavigate } from "react-router-dom";'
        );
        content = content.replace(
            'import { Link } from "react-router-dom";',
            'import { Link, useNavigate } from "react-router-dom";'
        );
    }
    fs.writeFileSync(file, content);
  }
});
