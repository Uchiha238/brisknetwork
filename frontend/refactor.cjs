const fs = require('fs');
let code = fs.readFileSync('src/components/features/AddUnifiedShipmentForm.jsx', 'utf8');

const sectionHeaderMatch = code.match(/  const SectionHeader = \(\{[\s\S]*?\)\;[\n\r]*/);
const formFieldMatch = code.match(/  const FormField = \(\{[\s\S]*?\)\;[\n\r]*/);

if (sectionHeaderMatch && formFieldMatch) {
    let sectionHeaderStr = sectionHeaderMatch[0].trim();
    let formFieldStr = formFieldMatch[0].trim();

    code = code.replace(sectionHeaderMatch[0], '');
    code = code.replace(formFieldMatch[0], '');

    formFieldStr = formFieldStr.replace(/inputMaxWidth = "none" }\) => \(/, 'inputMaxWidth = "none", onChange }) => (');
    formFieldStr = formFieldStr.replace(/onChange=\{handleChange\}/g, 'onChange={onChange}');

    const exportIndex = code.indexOf('export function AddUnifiedShipmentForm');
    code = code.substring(0, exportIndex) + sectionHeaderStr + '\n\n' + formFieldStr + '\n\n' + code.substring(exportIndex);

    code = code.replace(/<FormField /g, '<FormField onChange={handleChange} ');

    fs.writeFileSync('src/components/features/AddUnifiedShipmentForm.jsx', code);
    console.log('Successfully refactored AddUnifiedShipmentForm.jsx');
} else {
    console.log('Could not find matches');
}
