import { View } from "../../../ts-common/view";
/** Supported export format types. */
export type TExportType = "pdf" | "png";
/** Standard paper format names for PDF export. */
export type TPaperFormat = "Letter" | "Legal" | "Tabloid" | "Ledger" | "A0" | "A1" | "A2" | "A3" | "A4" | "A5" | "A6";
/**
 * Base configuration for file export (PDF or PNG).
 * @example
 * ```ts
 * diagram.export.png({
 *     name: "my-diagram",
 *     exportStyles: true,
 *     header: "<h1>Diagram Export</h1>",
 *     footer: "<p>Page footer</p>",
 * });
 * ```
 */
export interface IExportFileConfig {
    /** The URL of the export service endpoint. */
    url?: string;
    /** The file name for the exported file (without extension). */
    name?: string;
    /** HTML content for the page header. */
    header?: string;
    /** HTML content for the page footer. */
    footer?: string;
    /**
     * Whether to include CSS styles when exporting. Pass an array of CSS URLs for custom styles.
     * @default true
     */
    exportStyles?: boolean | string[];
}
/**
 * Full configuration for PDF export. Extends {@link IExportFileConfig} with PDF-specific options.
 * @example
 * ```ts
 * diagram.export.pdf({
 *     name: "my-diagram",
 *     pdf: {
 *         format: "A4",
 *         landscape: true,
 *         scale: 0.8,
 *         margin: { top: "10mm", bottom: "10mm" },
 *     },
 * });
 * ```
 */
export interface IPDFConfig extends IExportFileConfig {
    /** PDF-specific rendering options. */
    pdf?: {
        /** The rendering scale factor. */
        scale?: number;
        /** Whether to render in landscape orientation. */
        landscape?: boolean;
        /** The paper format (e.g., `"A4"`, `"Letter"`). */
        format?: TPaperFormat;
        /** Page margins (values in px, in, cm, or mm). */
        margin?: {
            /** Top margin (supports px, in, cm, mm units). */
            top?: string | number;
            /** Right margin (supports px, in, cm, mm units). */
            right?: string | number;
            /** Bottom margin (supports px, in, cm, mm units). */
            bottom?: string | number;
            /** Left margin (supports px, in, cm, mm units). */
            left?: string | number;
        };
        /** Custom page width (overrides format). */
        width?: string;
        /** Custom page height (overrides format). */
        height?: string;
        /** Page ranges to print (e.g., `"1-5"`, `"1,3,5"`). */
        pageRanges?: string;
        /** Whether to display header and footer templates. */
        displayHeaderFooter?: boolean;
        /** HTML template for the page footer. */
        footerTemplate?: string;
        /** HTML template for the page header. */
        headerTemplate?: string;
        /** @internal Whether to print background graphics. */
        printBackground?: boolean;
    };
}
/** Configuration for PNG export. Alias for {@link IExportFileConfig}. */
export type IPNGConfig = IExportFileConfig;
export declare class Exporter {
    private _name;
    private _version;
    private _view;
    constructor(_name: string, _version: string, _view: View);
    /**
     * Exports the diagram as a PDF file.
     * @param config - Optional PDF export configuration.
     * @returns A promise that resolves when the export file has been downloaded.
     * @example
     * ```ts
     * diagram.export.pdf({
     *     name: "flowchart",
     *     pdf: { format: "A4", landscape: true },
     * });
     * ```
     */
    pdf(config?: IPDFConfig): Promise<void>;
    /**
     * Exports the diagram as a PNG image.
     * @param config - Optional PNG export configuration.
     * @returns A promise that resolves when the export file has been downloaded.
     * @example
     * ```ts
     * diagram.export.png({ name: "flowchart" });
     * ```
     */
    png(config?: IPNGConfig): Promise<void>;
    protected _rawExport(config: IPDFConfig | IPNGConfig, mode: string, view: View): Promise<void>;
    private _normalizeLink;
}
