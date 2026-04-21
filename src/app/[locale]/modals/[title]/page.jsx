"use client";

// client component that fetches and renders a modal when preview is active.
import { useEffect, useState } from "react";
import { useParams} from "next/navigation";
import { ContentstackClient } from "@/lib/contentstack-client";
import Modal from "@/components/modal";
import { inLivePreview } from "@/utils/lp";

export default function ModalPreviewPage() {
  const params = useParams();
  const [modalData, setModalData] = useState(null);

  const isActivePreview = inLivePreview();

  useEffect(() => {
    if (!isActivePreview) return;
    if (!params?.title) return;

    async function load() {
      const modalUrl = `/modals/${params.title}`;
      const entries = await ContentstackClient.getElementByUrl(
        "modal",
        modalUrl,
        params.locale
      );
      setModalData(entries?.[0] || null);
    }
    load();
    ContentstackClient.onEntryChange(load);
  }, [isActivePreview, params.title, params.locale]);


  if (!isActivePreview) {
    return null;
  }

  if (!modalData) {
    return null;
  }

  return <Modal content={[modalData]} open={true} onClose={() => {}} />;
}