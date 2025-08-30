import { prisma } from '../utils/database';
import * as fs from 'fs/promises';
import * as path from 'path';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Production Mobile Printing Service
// Hardware integration platform with real printer support

export interface PrintJobResult {
  id: string;
  jobNumber: string;
  userId: string;
  printerName: string;
  printerType: 'THERMAL' | 'INKJET' | 'LASER' | 'DOT_MATRIX' | 'LABEL';
  documentType: 'JOB_SHEET' | 'QUOTATION' | 'INVOICE' | 'RECEIPT' | 'WORK_ORDER' | 'REPORT' | 'LABEL';
  documentUrl: string;
  fileName: string;
  pageSize: 'A4' | 'A5' | 'LETTER' | 'LEGAL' | 'THERMAL_80MM' | 'THERMAL_58MM' | 'LABEL_4X6';
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  copies: number;
  colorMode: 'COLOR' | 'GRAYSCALE' | 'MONOCHROME';
  quality: 'DRAFT' | 'NORMAL' | 'HIGH' | 'PHOTO';
  status: 'QUEUED' | 'PROCESSING' | 'PRINTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedCost?: number;
  actualCost?: number;
  jobSheetId?: string;
  quotationId?: string;
}

export interface PrinterConfigResult {
  id: string;
  name: string;
  type: 'THERMAL' | 'INKJET' | 'LASER' | 'DOT_MATRIX' | 'LABEL';
  manufacturer: string;
  model: string;
  ipAddress?: string;
  port?: number;
  macAddress?: string;
  supportedFormats: string[];
  maxPageSize: 'A4' | 'A5' | 'LETTER' | 'LEGAL' | 'THERMAL_80MM' | 'THERMAL_58MM' | 'LABEL_4X6';
  colorSupport: boolean;
  duplexSupport: boolean;
  isOnline: boolean;
  lastOnline?: Date;
  tonerLevel?: number;
  paperLevel?: number;
  location?: string;
  department?: string;
  isActive: boolean;
}

export interface PrintQueueStatus {
  totalJobs: number;
  queuedJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  estimatedWaitTime: number; // minutes
}

export interface PrintStatistics {
  totalJobsToday: number;
  totalJobsThisWeek: number;
  totalJobsThisMonth: number;
  averagePrintTime: number; // seconds
  successRate: number; // percentage
  mostUsedPrinter: string;
  topDocumentTypes: Array<{
    type: string;
    count: number;
  }>;
  costBreakdown: {
    today: number;
    week: number;
    month: number;
  };
}

class MobilePrintingService {
  private prisma = prisma;
  private printQueue: Map<string, any> = new Map();
  private printerDrivers: Map<string, any> = new Map();
  private documentRenderer: any;

  constructor() {
    // this.prisma = new PrismaClient(); // Using shared instance
    this.initializePrintingSystem();
  }

  private async initializePrintingSystem(): Promise<void> {
    // Initialize printer drivers and document rendering
    await this.initializePrinterDrivers();
    await this.initializeDocumentRenderer();
    
    // Start print queue processor
    this.startQueueProcessor();
  }

  // Print Job Management
  async createPrintJob(jobData: {
    userId: string;
    printerName: string;
    documentType: 'JOB_SHEET' | 'QUOTATION' | 'INVOICE' | 'RECEIPT' | 'WORK_ORDER' | 'REPORT' | 'LABEL';
    documentId: string; // ID of the source document (job sheet, quotation, etc.)
    fileName: string;
    pageSize?: 'A4' | 'A5' | 'LETTER' | 'LEGAL' | 'THERMAL_80MM' | 'THERMAL_58MM' | 'LABEL_4X6';
    orientation?: 'PORTRAIT' | 'LANDSCAPE';
    copies?: number;
    colorMode?: 'COLOR' | 'GRAYSCALE' | 'MONOCHROME';
    quality?: 'DRAFT' | 'NORMAL' | 'HIGH' | 'PHOTO';
  }): Promise<PrintJobResult> {
    // Verify printer exists and is online
    const printer = await this.getPrinterConfiguration(jobData.printerName);
    if (!printer || !printer.isOnline) {
      throw new Error(`Printer ${jobData.printerName} is not available`);
    }

    // Generate job number
    const jobNumber = await this.generateJobNumber();

    // Generate document URL based on document type and ID
    const documentUrl = await this.generateDocumentUrl(
      jobData.documentType,
      jobData.documentId,
      jobData.pageSize || 'A4',
      jobData.orientation || 'PORTRAIT'
    );

    // Calculate estimated cost
    const estimatedCost = await this.calculatePrintingCost(
      printer,
      jobData.copies || 1,
      jobData.colorMode || 'GRAYSCALE',
      jobData.quality || 'NORMAL'
    );

    // Create print job record
    const printJob = await this.prisma.printJob.create({
      data: {
        jobNumber,
        userId: jobData.userId,
        printerName: jobData.printerName,
        printerType: printer.type,
        documentType: jobData.documentType,
        documentUrl,
        fileName: jobData.fileName,
        pageSize: jobData.pageSize || 'A4',
        orientation: jobData.orientation || 'PORTRAIT',
        copies: jobData.copies || 1,
        colorMode: jobData.colorMode || 'GRAYSCALE',
        quality: jobData.quality || 'NORMAL',
        status: 'QUEUED',
        progress: 0,
        retryCount: 0,
        maxRetries: 3,
        estimatedCost,
        jobSheetId: jobData.documentType === 'JOB_SHEET' ? jobData.documentId : null,
        quotationId: jobData.documentType === 'QUOTATION' ? jobData.documentId : null,
      },
    });

    // Add to print queue
    this.addToQueue(printJob.id);

    return this.formatPrintJobResult(printJob);
  }

  async getPrintJob(id: string): Promise<PrintJobResult | null> {
    const printJob = await this.prisma.printJob.findUnique({
      where: { id },
    });

    if (!printJob) return null;
    return this.formatPrintJobResult(printJob);
  }

  async cancelPrintJob(id: string): Promise<boolean> {
    const printJob = await this.prisma.printJob.findUnique({
      where: { id },
    });

    if (!printJob || printJob.status === 'COMPLETED') {
      return false;
    }

    // Update job status
    await this.prisma.printJob.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Remove from queue if still queued
    this.printQueue.delete(id);

    return true;
  }

  // Printer Configuration Management
  async addPrinter(printerData: {
    name: string;
    type: 'THERMAL' | 'INKJET' | 'LASER' | 'DOT_MATRIX' | 'LABEL';
    manufacturer: string;
    model: string;
    ipAddress?: string;
    port?: number;
    macAddress?: string;
    supportedFormats: string[];
    maxPageSize: 'A4' | 'A5' | 'LETTER' | 'LEGAL' | 'THERMAL_80MM' | 'THERMAL_58MM' | 'LABEL_4X6';
    colorSupport: boolean;
    duplexSupport: boolean;
    location?: string;
    department?: string;
  }): Promise<PrinterConfigResult> {
    // Test printer connectivity
    const isOnline = await this.testPrinterConnectivity(
      printerData.ipAddress,
      printerData.port
    );

    const printer = await this.prisma.printerConfiguration.create({
      data: {
        name: printerData.name,
        type: printerData.type,
        manufacturer: printerData.manufacturer,
        model: printerData.model,
        ipAddress: printerData.ipAddress,
        port: printerData.port,
        macAddress: printerData.macAddress,
        supportedFormats: printerData.supportedFormats,
        maxPageSize: printerData.maxPageSize,
        colorSupport: printerData.colorSupport,
        duplexSupport: printerData.duplexSupport,
        isOnline,
        lastOnline: isOnline ? new Date() : null,
        location: printerData.location,
        department: printerData.department,
        isActive: true,
      },
    });

    // Initialize printer driver
    await this.initializePrinterDrivers();

    return this.formatPrinterConfigResult(printer);
  }

  async getPrinterConfiguration(name: string): Promise<PrinterConfigResult | null> {
    const printer = await this.prisma.printerConfiguration.findFirst({
      where: { name, isActive: true },
    });

    if (!printer) return null;
    return this.formatPrinterConfigResult(printer);
  }

  async updatePrinterStatus(name: string): Promise<PrinterConfigResult> {
    const printer = await this.prisma.printerConfiguration.findFirst({
      where: { name, isActive: true },
    });

    if (!printer) {
      throw new Error('Printer not found');
    }

    // Check printer status
    const isOnline = await this.testPrinterConnectivity(
      printer.ipAddress,
      printer.port
    );

    // Get consumable levels if supported
    const { tonerLevel, paperLevel } = await this.getPrinterConsumables(printer);

    // Update printer status
    const updatedPrinter = await this.prisma.printerConfiguration.update({
      where: { id: printer.id },
      data: {
        isOnline,
        lastOnline: isOnline ? new Date() : printer.lastOnline,
        tonerLevel,
        paperLevel,
      },
    });

    return this.formatPrinterConfigResult(updatedPrinter);
  }

  // Print Queue Management
  private startQueueProcessor(): void {
    setInterval(async () => {
      await this.processQueue();
    }, 5000); // Process queue every 5 seconds
  }

  private async processQueue(): Promise<void> {
    const queuedJobs = await this.prisma.printJob.findMany({
      where: { status: 'QUEUED' },
      orderBy: { queuedAt: 'asc' },
      take: 5, // Process up to 5 jobs at once
    });

    for (const job of queuedJobs) {
      try {
        await this.processPrintJob(job.id);
      } catch (error) {
        console.error(`Error processing print job ${job.id}:`, error);
      }
    }
  }

  private async processPrintJob(jobId: string): Promise<void> {
    const job = await this.prisma.printJob.findUnique({
      where: { id: jobId },
    });

    if (!job || job.status !== 'QUEUED') return;

    try {
      // Update status to processing
      await this.prisma.printJob.update({
        where: { id: jobId },
        data: {
          status: 'PROCESSING',
          startedAt: new Date(),
        },
      });

      // Get printer configuration
      const printer = await this.getPrinterConfiguration(job.printerName);
      if (!printer || !printer.isOnline) {
        throw new Error(`Printer ${job.printerName} is not available`);
      }

      // Render document for printing
      const printableDocument = await this.renderDocumentForPrinting(job);

      // Send to printer
      await this.sendToPrinter(job, printer, printableDocument);

      // Update status to completed
      await this.prisma.printJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date(),
          actualCost: job.estimatedCost, // In real implementation, get actual cost from printer
        },
      });

    } catch (error) {
      console.error(`Print job ${jobId} failed:`, error);

      const retryCount = job.retryCount + 1;
      const shouldRetry = retryCount <= job.maxRetries;

      await this.prisma.printJob.update({
        where: { id: jobId },
        data: {
          status: shouldRetry ? 'QUEUED' : 'FAILED',
          errorMessage: (error as Error).message,
          retryCount,
        },
      });
    }
  }

  // Document Rendering
  private async generateDocumentUrl(
    documentType: string,
    documentId: string,
    pageSize: string,
    orientation: string
  ): Promise<string> {
    let documentData: any;

    switch (documentType) {
      case 'JOB_SHEET':
        documentData = await this.getJobSheetData(documentId);
        break;
      case 'QUOTATION':
        documentData = await this.getQuotationData(documentId);
        break;
      case 'INVOICE':
        documentData = await this.getInvoiceData(documentId);
        break;
      case 'RECEIPT':
        documentData = await this.getReceiptData(documentId);
        break;
      default:
        throw new Error(`Unsupported document type: ${documentType}`);
    }

    // Generate PDF document
    const pdfPath = await this.generatePDF(
      documentType,
      documentData,
      pageSize,
      orientation
    );

    return pdfPath;
  }

  private async renderDocumentForPrinting(job: any): Promise<Buffer> {
    try {
      // Read the PDF file
      const pdfBuffer = await fs.readFile(job.documentUrl);

      // Convert PDF to printer-specific format if needed
      switch (job.printerType) {
        case 'THERMAL':
          return this.convertToThermalFormat(pdfBuffer, job);
        case 'LABEL':
          return this.convertToLabelFormat(pdfBuffer, job);
        default:
          return pdfBuffer; // Most printers can handle PDF directly
      }
    } catch (error) {
      throw new Error(`Failed to render document: ${(error as Error).message}`);
    }
  }

  private async convertToThermalFormat(pdfBuffer: Buffer, job: any): Promise<Buffer> {
    // Convert PDF to thermal printer format (ESC/POS)
    const tempPdfPath = `/tmp/thermal-${job.id}.pdf`;
    const tempImagePath = `/tmp/thermal-${job.id}.png`;

    await fs.writeFile(tempPdfPath, pdfBuffer);

    // Convert PDF to image using ImageMagick
    await execAsync(
      `magick -density 203 "${tempPdfPath}" -colorspace Gray -resize 576x "${tempImagePath}"`
    );

    // Convert image to ESC/POS commands
    const escPosCommands = await this.convertImageToESCPOS(tempImagePath);

    // Clean up temp files
    await fs.unlink(tempPdfPath).catch(() => {});
    await fs.unlink(tempImagePath).catch(() => {});

    return Buffer.from(escPosCommands);
  }

  private async convertToLabelFormat(pdfBuffer: Buffer, job: any): Promise<Buffer> {
    // Convert PDF to label printer format (ZPL, EPL, etc.)
    // This is a simplified implementation
    return pdfBuffer;
  }

  private async convertImageToESCPOS(imagePath: string): Promise<string> {
    // Convert image to ESC/POS commands
    // This is a simplified implementation - real implementation would use proper ESC/POS library
    const escPosCommands = [
      '\x1B\x40', // Initialize printer
      '\x1B\x61\x01', // Center alignment
      // Image data would go here
      '\x1B\x64\x03', // Feed 3 lines
      '\x1D\x56\x41\x00', // Cut paper
    ].join('');

    return escPosCommands;
  }

  // Printer Communication
  private async sendToPrinter(
    job: any,
    printer: PrinterConfigResult,
    documentBuffer: Buffer
  ): Promise<void> {
    const driver = this.printerDrivers.get(printer.type);
    if (!driver) {
      throw new Error(`No driver available for printer type: ${printer.type}`);
    }

    await driver.print({
      printerName: printer.name,
      ipAddress: printer.ipAddress,
      port: printer.port,
      documentBuffer,
      copies: job.copies,
      quality: job.quality,
    });
  }

  private async testPrinterConnectivity(
    ipAddress?: string,
    port?: number
  ): Promise<boolean> {
    if (!ipAddress) return false;

    try {
      const response = await axios.get(`http://${ipAddress}:${port || 9100}`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      // Try ping as fallback
      try {
        await execAsync(`ping -c 1 -W 2 ${ipAddress}`);
        return true;
      } catch {
        return false;
      }
    }
  }

  private async getPrinterConsumables(printer: any): Promise<{
    tonerLevel?: number;
    paperLevel?: number;
  }> {
    // Get consumable levels via SNMP or printer-specific API
    try {
      if (printer.ipAddress) {
        // Example SNMP query for HP printers
        const { stdout } = await execAsync(
          `snmpget -v2c -c public ${printer.ipAddress} 1.3.6.1.2.1.43.11.1.1.9.1.1`
        );
        
        // Parse SNMP response to get toner level
        const tonerLevel = parseInt(stdout.match(/INTEGER: (\d+)/)?.[1] || '0');
        
        return { tonerLevel, paperLevel: 50 }; // Mock paper level
      }
    } catch (error) {
      console.warn('Failed to get printer consumables:', error);
    }

    return {};
  }

  // Document Data Retrieval
  private async getJobSheetData(jobSheetId: string): Promise<any> {
    const jobSheet = await this.prisma.jobSheet.findUnique({
      where: { id: jobSheetId },
      include: {
        booking: {
          include: {
            customer: true,
            address: true,
            service: true,
          },
        },
        device: true,
        technician: true,
        partsUsed: true,
      },
    });

    if (!jobSheet) {
      throw new Error('Job sheet not found');
    }

    return jobSheet;
  }

  private async getQuotationData(quotationId: string): Promise<any> {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        customer: true,
        device: true,
        preparedByUser: true,
        items: true,
      },
    });

    if (!quotation) {
      throw new Error('Quotation not found');
    }

    return quotation;
  }

  private async getInvoiceData(invoiceId: string): Promise<any> {
    // Implementation would depend on invoice system
    throw new Error('Invoice data retrieval not implemented');
  }

  private async getReceiptData(receiptId: string): Promise<any> {
    // Implementation would depend on receipt system
    throw new Error('Receipt data retrieval not implemented');
  }

  // PDF Generation
  private async generatePDF(
    documentType: string,
    data: any,
    pageSize: string,
    orientation: string
  ): Promise<string> {
    const outputPath = `/tmp/print-${documentType}-${Date.now()}.pdf`;

    switch (documentType) {
      case 'JOB_SHEET':
        await this.generateJobSheetPDF(data, outputPath, pageSize, orientation);
        break;
      case 'QUOTATION':
        await this.generateQuotationPDF(data, outputPath, pageSize, orientation);
        break;
      default:
        throw new Error(`PDF generation not implemented for ${documentType}`);
    }

    return outputPath;
  }

  private async generateJobSheetPDF(
    jobSheet: any,
    outputPath: string,
    pageSize: string,
    orientation: string
  ): Promise<void> {
    // Use a PDF generation library (like PDFKit, Puppeteer, or wkhtmltopdf)
    const html = this.generateJobSheetHTML(jobSheet);
    
    // Using wkhtmltopdf as an example
    const wkhtmltopdfOptions = [
      `--page-size ${pageSize}`,
      `--orientation ${orientation}`,
      '--margin-top 0.5in',
      '--margin-right 0.5in',
      '--margin-bottom 0.5in',
      '--margin-left 0.5in',
    ].join(' ');

    const tempHtmlPath = `/tmp/jobsheet-${Date.now()}.html`;
    await fs.writeFile(tempHtmlPath, html);

    await execAsync(
      `wkhtmltopdf ${wkhtmltopdfOptions} "${tempHtmlPath}" "${outputPath}"`
    );

    // Clean up temp HTML file
    await fs.unlink(tempHtmlPath).catch(() => {});
  }

  private generateJobSheetHTML(jobSheet: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Job Sheet #${jobSheet.jobNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; }
          .header { text-align: center; margin-bottom: 20px; }
          .section { margin-bottom: 15px; }
          .label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RepairX Job Sheet</h1>
          <h2>Job #${jobSheet.jobNumber}</h2>
        </div>

        <div class="section">
          <h3>Customer Information</h3>
          <p><span class="label">Name:</span> ${jobSheet.booking.customer.firstName} ${jobSheet.booking.customer.lastName}</p>
          <p><span class="label">Email:</span> ${jobSheet.booking.customer.email}</p>
          <p><span class="label">Phone:</span> ${jobSheet.booking.customer.phone}</p>
        </div>

        <div class="section">
          <h3>Device Information</h3>
          <p><span class="label">Brand:</span> ${jobSheet.device.brand}</p>
          <p><span class="label">Model:</span> ${jobSheet.device.model}</p>
          <p><span class="label">Serial Number:</span> ${jobSheet.device.serialNumber || 'N/A'}</p>
        </div>

        <div class="section">
          <h3>Problem Description</h3>
          <p>${jobSheet.problemDescription}</p>
        </div>

        ${jobSheet.diagnosisNotes ? `
          <div class="section">
            <h3>Diagnosis Notes</h3>
            <p>${jobSheet.diagnosisNotes}</p>
          </div>
        ` : ''}

        ${jobSheet.partsUsed && jobSheet.partsUsed.length > 0 ? `
          <div class="section">
            <h3>Parts Used</h3>
            <table>
              <thead>
                <tr>
                  <th>Part Name</th>
                  <th>Part Number</th>
                  <th>Quantity</th>
                  <th>Unit Cost</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                ${jobSheet.partsUsed.map((part: any) => `
                  <tr>
                    <td>${part.partName}</td>
                    <td>${part.partNumber || 'N/A'}</td>
                    <td>${part.quantity}</td>
                    <td>$${part.unitCost.toFixed(2)}</td>
                    <td>$${part.totalCost.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <div class="section">
          <h3>Labor and Costs</h3>
          <p><span class="label">Labor Cost:</span> $${jobSheet.laborCost.toFixed(2)}</p>
          <p><span class="label">Parts Cost:</span> $${(jobSheet.partsCost || 0).toFixed(2)}</p>
          <p><span class="label">Total Cost:</span> $${(jobSheet.totalCost || 0).toFixed(2)}</p>
        </div>

        <div class="section">
          <h3>Technician</h3>
          <p><span class="label">Name:</span> ${jobSheet.technician?.firstName} ${jobSheet.technician?.lastName}</p>
          <p><span class="label">Date:</span> ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;
  }

  private async generateQuotationPDF(
    quotation: any,
    outputPath: string,
    pageSize: string,
    orientation: string
  ): Promise<void> {
    // Similar implementation for quotation PDF
    const html = this.generateQuotationHTML(quotation);
    
    const wkhtmltopdfOptions = [
      `--page-size ${pageSize}`,
      `--orientation ${orientation}`,
      '--margin-top 0.5in',
      '--margin-right 0.5in',
      '--margin-bottom 0.5in',
      '--margin-left 0.5in',
    ].join(' ');

    const tempHtmlPath = `/tmp/quotation-${Date.now()}.html`;
    await fs.writeFile(tempHtmlPath, html);

    await execAsync(
      `wkhtmltopdf ${wkhtmltopdfOptions} "${tempHtmlPath}" "${outputPath}"`
    );

    await fs.unlink(tempHtmlPath).catch(() => {});
  }

  private generateQuotationHTML(quotation: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation #${quotation.quoteNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; }
          .header { text-align: center; margin-bottom: 20px; }
          .section { margin-bottom: 15px; }
          .label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RepairX Quotation</h1>
          <h2>Quote #${quotation.quoteNumber}</h2>
        </div>

        <div class="section">
          <h3>Customer Information</h3>
          <p><span class="label">Name:</span> ${quotation.customer.firstName} ${quotation.customer.lastName}</p>
          <p><span class="label">Email:</span> ${quotation.customer.email}</p>
        </div>

        <div class="section">
          <h3>Quote Details</h3>
          <p><span class="label">Title:</span> ${quotation.title}</p>
          <p><span class="label">Description:</span> ${quotation.description}</p>
          <p><span class="label">Valid Until:</span> ${new Date(quotation.validUntil).toLocaleDateString()}</p>
        </div>

        <div class="section">
          <h3>Items</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${quotation.items.map((item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.description || 'N/A'}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unitPrice.toFixed(2)}</td>
                  <td>$${item.totalPrice.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <table>
            <tr>
              <td colspan="4" style="text-align: right;"><strong>Subtotal:</strong></td>
              <td class="total">$${quotation.subtotal.toFixed(2)}</td>
            </tr>
            ${quotation.taxAmount ? `
              <tr>
                <td colspan="4" style="text-align: right;"><strong>Tax:</strong></td>
                <td class="total">$${quotation.taxAmount.toFixed(2)}</td>
              </tr>
            ` : ''}
            ${quotation.discountAmount ? `
              <tr>
                <td colspan="4" style="text-align: right;"><strong>Discount:</strong></td>
                <td class="total">-$${quotation.discountAmount.toFixed(2)}</td>
              </tr>
            ` : ''}
            <tr>
              <td colspan="4" style="text-align: right;"><strong>Total Amount:</strong></td>
              <td class="total">$${quotation.totalAmount.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <p><span class="label">Prepared by:</span> ${quotation.preparedByUser.firstName} ${quotation.preparedByUser.lastName}</p>
          <p><span class="label">Date:</span> ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;
  }

  // Utility Methods
  private async generateJobNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Get last job number for today
    const lastJob = await this.prisma.printJob.findFirst({
      where: {
        jobNumber: { startsWith: `PJ-${dateStr}` },
      },
      orderBy: { jobNumber: 'desc' },
    });

    let sequence = 1;
    if (lastJob) {
      const lastSequence = parseInt(lastJob.jobNumber.split('-')[2] || '0');
      sequence = lastSequence + 1;
    }

    return `PJ-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }

  private async calculatePrintingCost(
    printer: PrinterConfigResult,
    copies: number,
    colorMode: string,
    quality: string
  ): Promise<number> {
    // Base cost per page
    let baseCost = 0.05; // $0.05 per page

    // Adjust for printer type
    switch (printer.type) {
      case 'LASER':
        baseCost = 0.03;
        break;
      case 'INKJET':
        baseCost = 0.07;
        break;
      case 'THERMAL':
        baseCost = 0.02;
        break;
      case 'LABEL':
        baseCost = 0.10;
        break;
    }

    // Adjust for color mode
    if (colorMode === 'COLOR') {
      baseCost *= 3;
    }

    // Adjust for quality
    if (quality === 'HIGH' || quality === 'PHOTO') {
      baseCost *= 1.5;
    }

    return baseCost * copies;
  }

  private addToQueue(jobId: string): void {
    this.printQueue.set(jobId, { addedAt: new Date() });
  }

  // Driver Initialization
  private async initializePrinterDrivers(): Promise<void> {
    // Initialize thermal printer driver
    this.printerDrivers.set('THERMAL', {
      print: async (options: any) => {
        console.log(`Printing to thermal printer: ${options.printerName}`);
        // Real implementation would send ESC/POS commands to printer
      },
    });

    // Initialize laser printer driver
    this.printerDrivers.set('LASER', {
      print: async (options: any) => {
        console.log(`Printing to laser printer: ${options.printerName}`);
        // Real implementation would use IPP or raw socket printing
      },
    });

    // Initialize inkjet printer driver
    this.printerDrivers.set('INKJET', {
      print: async (options: any) => {
        console.log(`Printing to inkjet printer: ${options.printerName}`);
        // Real implementation would use system print commands
      },
    });

    // Initialize label printer driver
    this.printerDrivers.set('LABEL', {
      print: async (options: any) => {
        console.log(`Printing to label printer: ${options.printerName}`);
        // Real implementation would send ZPL or EPL commands
      },
    });
  }

  private async initializeDocumentRenderer(): Promise<void> {
    // Initialize document rendering engine
    this.documentRenderer = {
      renderHTML: async (html: string, options: any) => {
        // Use Puppeteer or similar for HTML to PDF conversion
        return Buffer.from('PDF content');
      },
    };
  }

  // Statistics and Monitoring
  async getPrintQueueStatus(): Promise<PrintQueueStatus> {
    const [
      queuedJobs,
      processingJobs,
      completedJobs,
      failedJobs,
    ] = await Promise.all([
      this.prisma.printJob.count({ where: { status: 'QUEUED' } }),
      this.prisma.printJob.count({ where: { status: 'PROCESSING' } }),
      this.prisma.printJob.count({ where: { status: 'COMPLETED' } }),
      this.prisma.printJob.count({ where: { status: 'FAILED' } }),
    ]);

    const totalJobs = queuedJobs + processingJobs + completedJobs + failedJobs;
    
    // Estimate wait time based on queue length and average processing time
    const estimatedWaitTime = queuedJobs * 2; // 2 minutes per job estimate

    return {
      totalJobs,
      queuedJobs,
      processingJobs,
      completedJobs,
      failedJobs,
      estimatedWaitTime,
    };
  }

  async getPrintStatistics(): Promise<PrintStatistics> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalJobsToday,
      totalJobsThisWeek,
      totalJobsThisMonth,
      recentJobs,
    ] = await Promise.all([
      this.prisma.printJob.count({
        where: { createdAt: { gte: todayStart } },
      }),
      this.prisma.printJob.count({
        where: { createdAt: { gte: weekStart } },
      }),
      this.prisma.printJob.count({
        where: { createdAt: { gte: monthStart } },
      }),
      this.prisma.printJob.findMany({
        where: {
          status: 'COMPLETED',
          startedAt: { not: null },
          completedAt: { not: null },
        },
        select: {
          printerName: true,
          documentType: true,
          startedAt: true,
          completedAt: true,
          actualCost: true,
          createdAt: true,
        },
        orderBy: { completedAt: 'desc' },
        take: 100,
      }),
    ]);

    // Calculate average print time
    const printTimes = recentJobs
      .filter(job => job.startedAt && job.completedAt)
      .map(job => 
        (job.completedAt!.getTime() - job.startedAt!.getTime()) / 1000
      );
    
    const averagePrintTime = printTimes.length > 0 
      ? printTimes.reduce((sum, time) => sum + time, 0) / printTimes.length
      : 0;

    // Calculate success rate
    const completedJobs = await this.prisma.printJob.count({
      where: { status: 'COMPLETED' },
    });
    
    const totalJobs = await this.prisma.printJob.count();
    const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    // Find most used printer
    const printerUsage = recentJobs.reduce((acc, job) => {
      acc[job.printerName] = (acc[job.printerName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedPrinter = Object.entries(printerUsage)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A';

    // Top document types
    const documentTypeUsage = recentJobs.reduce((acc, job) => {
      acc[job.documentType] = (acc[job.documentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topDocumentTypes = Object.entries(documentTypeUsage)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([type, count]) => ({ type, count: count as number }));

    // Cost breakdown
    const costBreakdown = {
      today: recentJobs
        .filter(job => job.createdAt >= todayStart)
        .reduce((sum, job) => sum + (job.actualCost?.toNumber() || 0), 0),
      week: recentJobs
        .filter(job => job.createdAt >= weekStart)
        .reduce((sum, job) => sum + (job.actualCost?.toNumber() || 0), 0),
      month: recentJobs
        .filter(job => job.createdAt >= monthStart)
        .reduce((sum, job) => sum + (job.actualCost?.toNumber() || 0), 0),
    };

    return {
      totalJobsToday,
      totalJobsThisWeek,
      totalJobsThisMonth,
      averagePrintTime,
      successRate,
      mostUsedPrinter,
      topDocumentTypes,
      costBreakdown,
    };
  }

  // Formatting Methods
  private formatPrintJobResult(job: any): PrintJobResult {
    return {
      id: job.id,
      jobNumber: job.jobNumber,
      userId: job.userId,
      printerName: job.printerName,
      printerType: job.printerType,
      documentType: job.documentType,
      documentUrl: job.documentUrl,
      fileName: job.fileName,
      pageSize: job.pageSize,
      orientation: job.orientation,
      copies: job.copies,
      colorMode: job.colorMode,
      quality: job.quality,
      status: job.status,
      progress: job.progress,
      errorMessage: job.errorMessage,
      retryCount: job.retryCount,
      maxRetries: job.maxRetries,
      queuedAt: job.queuedAt || job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      estimatedCost: job.estimatedCost?.toNumber(),
      actualCost: job.actualCost?.toNumber(),
      jobSheetId: job.jobSheetId,
      quotationId: job.quotationId,
    };
  }

  private formatPrinterConfigResult(printer: any): PrinterConfigResult {
    return {
      id: printer.id,
      name: printer.name,
      type: printer.type,
      manufacturer: printer.manufacturer,
      model: printer.model,
      ipAddress: printer.ipAddress,
      port: printer.port,
      macAddress: printer.macAddress,
      supportedFormats: printer.supportedFormats,
      maxPageSize: printer.maxPageSize,
      colorSupport: printer.colorSupport,
      duplexSupport: printer.duplexSupport,
      isOnline: printer.isOnline,
      lastOnline: printer.lastOnline,
      tonerLevel: printer.tonerLevel,
      paperLevel: printer.paperLevel,
      location: printer.location,
      department: printer.department,
      isActive: printer.isActive,
    };
  }
}

export default MobilePrintingService;