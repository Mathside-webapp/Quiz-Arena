-- Run once AFTER supabase/setup.sql in the same dedicated QuizArena project.
-- The bucket is public-read because students need to see question pictures during a game.
-- Use non-guessable filenames; do not place private pupil files here.
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('qa-question-images','qa-question-images',true,500000,ARRAY['image/jpeg'])
ON CONFLICT (id) DO NOTHING;
CREATE POLICY qa_teacher_upload_question_image
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
 bucket_id='qa-question-images'
 AND (storage.foldername(name))[1]=auth.uid()::text
 AND NOT COALESCE((auth.jwt()->>'is_anonymous')::boolean,false)
);
CREATE POLICY qa_teacher_delete_question_image
ON storage.objects FOR DELETE TO authenticated
USING (
 bucket_id='qa-question-images'
 AND (storage.foldername(name))[1]=auth.uid()::text
 AND NOT COALESCE((auth.jwt()->>'is_anonymous')::boolean,false)
);
