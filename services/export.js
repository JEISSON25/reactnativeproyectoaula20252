import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

// Exportar productos a CSV
export async function exportToCSV(products) {
    if (!products || products.length === 0) {
        Alert.alert("Error", "No hay productos para exportar");
        return;
    }

    try {
        let csv = "Nombre,Código,Cantidad,Stock Mínimo,Estado\n";

        for (let i = 0; i < products.length; i++) {
            let product = products[i];
            let estado = "STOCK NORMAL";

            if (product.quantity === 0) {
                estado = "SIN STOCK";
            } else if (product.minStock && product.quantity <= product.minStock) {
                estado = "STOCK BAJO";
            }

            let minStock = product.minStock || 0;
            csv += `"${product.name}","${product.code}",${product.quantity},${minStock},"${estado}"\n`;
        }

        let fecha = new Date();
        let nombreArchivo = `inventario_${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}.csv`;
        let rutaArchivo = FileSystem.documentDirectory + nombreArchivo;

        await FileSystem.writeAsStringAsync(rutaArchivo, csv);

        let puedeCompartir = await Sharing.isAvailableAsync();
        if (puedeCompartir) {
            await Sharing.shareAsync(rutaArchivo);
            return true;
        } else {
            Alert.alert("Error", "No se puede compartir en este dispositivo");
            return false;
        }
    } catch (error) {
        Alert.alert("Error", "No se pudo exportar el archivo");
        return false;
    }
}

// Exportar productos a PDF (realmente es un TXT)
export async function exportToPDF(products) {
    if (!products || products.length === 0) {
        Alert.alert("Error", "No hay productos para exportar");
        return;
    }

    try {
        let texto = "";
        texto += "═══════════════════════════════════════\n";
        texto += "     REPORTE DE INVENTARIO\n";

        let ahora = new Date();
        let fechaHora = ahora.toLocaleString('es-ES');
        texto += `     ${fechaHora}\n`;
        texto += "═══════════════════════════════════════\n\n";

        // Contar productos
        let total = products.length;
        let sinStock = 0;
        let stockBajo = 0;
        let cantidadTotal = 0;

        for (let i = 0; i < products.length; i++) {
            cantidadTotal += products[i].quantity || 0;

            if (products[i].quantity === 0) {
                sinStock++;
            } else if (products[i].minStock && products[i].quantity <= products[i].minStock) {
                stockBajo++;
            }
        }

        texto += "RESUMEN GENERAL\n";
        texto += "───────────────────────────────────────\n";
        texto += `Total de productos:      ${total}\n`;
        texto += `Cantidad total en stock: ${cantidadTotal}\n`;
        texto += `Productos sin stock:     ${sinStock}\n`;
        texto += `Productos con stock bajo: ${stockBajo}\n\n`;

        // Alertas
        if (sinStock > 0 || stockBajo > 0) {
            texto += "⚠️  ALERTAS\n";
            texto += "───────────────────────────────────────\n";
            if (sinStock > 0) {
                texto += `🚫 ${sinStock} producto(s) SIN STOCK\n`;
            }
            if (stockBajo > 0) {
                texto += `⚠️  ${stockBajo} producto(s) con STOCK BAJO\n`;
            }
            texto += "\n";
        }

        texto += "DETALLE DE PRODUCTOS\n";
        texto += "═══════════════════════════════════════\n\n";

        // Listar productos
        for (let i = 0; i < products.length; i++) {
            let product = products[i];
            let estado = "STOCK NORMAL";
            let emoji = "✅";

            if (product.quantity === 0) {
                estado = "SIN STOCK";
                emoji = "🚫";
            } else if (product.minStock && product.quantity <= product.minStock) {
                estado = "STOCK BAJO";
                emoji = "⚠️";
            }

            texto += `${i + 1}. ${emoji} ${product.name}\n`;
            texto += `   Código:        ${product.code}\n`;
            texto += `   Stock actual:  ${product.quantity}\n`;
            if (product.minStock) {
                texto += `   Stock mínimo:  ${product.minStock}\n`;
            }
            texto += `   Estado:        ${estado}\n`;
            texto += "───────────────────────────────────────\n";
        }

        texto += "\n═══════════════════════════════════════\n";
        texto += "Fin del reporte\n";
        texto += "═══════════════════════════════════════\n";

        let fecha = new Date();
        let nombreArchivo = `inventario_${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}.txt`;
        let rutaArchivo = FileSystem.documentDirectory + nombreArchivo;

        await FileSystem.writeAsStringAsync(rutaArchivo, texto);

        let puedeCompartir = await Sharing.isAvailableAsync();
        if (puedeCompartir) {
            await Sharing.shareAsync(rutaArchivo);
            return true;
        } else {
            Alert.alert("Error", "No se puede compartir en este dispositivo");
            return false;
        }
    } catch (error) {
        Alert.alert("Error", "No se pudo exportar el archivo");
        return false;
    }
}

// Exportar movimientos a CSV
export async function exportMovementsToCSV(movements) {
    if (!movements || movements.length === 0) {
        Alert.alert("Error", "No hay movimientos para exportar");
        return;
    }

    try {
        let csv = "Fecha,Producto,Tipo,Cantidad,Estado Sincronización\n";

        for (let i = 0; i < movements.length; i++) {
            let mov = movements[i];
            let fecha = new Date(mov.date).toLocaleString();
            let tipo = mov.type === "entrada" ? "Entrada" : "Salida";
            let sincronizado = mov.synced ? "Sincronizado" : "Pendiente";

            csv += `"${fecha}","${mov.productName}","${tipo}",${mov.quantity},"${sincronizado}"\n`;
        }

        let fecha = new Date();
        let nombreArchivo = `movimientos_${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}.csv`;
        let rutaArchivo = FileSystem.documentDirectory + nombreArchivo;

        await FileSystem.writeAsStringAsync(rutaArchivo, csv);

        let puedeCompartir = await Sharing.isAvailableAsync();
        if (puedeCompartir) {
            await Sharing.shareAsync(rutaArchivo);
            return true;
        } else {
            Alert.alert("Error", "No se puede compartir en este dispositivo");
            return false;
        }
    } catch (error) {
        Alert.alert("Error", "No se pudo exportar el archivo");
        return false;
    }
}
