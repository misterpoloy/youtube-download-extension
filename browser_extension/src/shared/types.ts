export type BridgeHealth = {
  status: string;
  service: string;
};

export type JobStatus =
  | "queued"
  | "starting"
  | "downloading"
  | "processing"
  | "completed"
  | "failed";

export type DownloadJob = {
  job_id: string;
  url: string;
  output_dir: string;
  cookies?: string | null;
  status: JobStatus;
  progress: number;
  downloaded_bytes: number;
  total_bytes?: number | null;
  filename?: string | null;
  error?: string | null;
  created_at: number;
  updated_at: number;
};

export type ExtensionSettings = {
  bridgeUrl: string;
  outputDir: string;
  cookiesPath: string;
};

export type RuntimeMessage =
  | {
      type: "bridge:health";
      bridgeUrl: string;
    }
  | {
      type: "bridge:start-download";
      bridgeUrl: string;
      url: string;
      outputDir: string;
      cookiesPath?: string;
    }
  | {
      type: "bridge:get-job";
      bridgeUrl: string;
      jobId: string;
    };
