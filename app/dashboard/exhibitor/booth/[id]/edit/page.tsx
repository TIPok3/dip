// app/dashboard/exhibitor/booth/[id]/edit/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/app/providers'
import { supabase } from '@/lib/supabase/client'
import { Toast } from '@/app/components/Toast'
import Link from 'next/link'

type BlockType = 'text' | 'image' | 'video' | 'file'

interface Block {
  id: string
  type: BlockType
  content: string
  title?: string
}

export default function EditBoothPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const [boothName, setBoothName] = useState('')
  const [description, setDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const [blocks, setBlocks] = useState<Block[]>([])

  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [exhibitionTitle, setExhibitionTitle] = useState('')
  const [companyName, setCompanyName] = useState('')

  useEffect(() => {
    if (id) loadBoothData()
  }, [id])

  const loadBoothData = async () => {
    setLoading(true)
    try {
      const { data: booth, error } = await supabase
        .from('booths')
        .select(`
          *,
          exhibitor:exhibitor_id (
            id,
            user_id,
            company_name,
            contact_email,
            contact_phone,
            website,
            description
          ),
          exhibition:exhibition_id (
            title
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!booth) throw new Error('Стенд не найден')
      if (!booth.exhibitor || booth.exhibitor.user_id !== user?.id) {
        setToast({ message: 'У вас нет доступа к этому стенду', type: 'error' })
        router.push('/dashboard/exhibitor/exhibitions')
        return
      }

      setBoothName(booth.name || '')
      setDescription(booth.description || booth.exhibitor?.description || '')
      setContactEmail(booth.exhibitor?.contact_email || '')
      setContactPhone(booth.exhibitor?.contact_phone || '')
      setWebsite(booth.exhibitor?.website || '')
      setTags(booth.tags || [])
      setExhibitionTitle(booth.exhibition?.title || '')
      setCompanyName(booth.exhibitor?.company_name || '')

      const savedBlocks = booth.blocks
      if (savedBlocks && Array.isArray(savedBlocks) && savedBlocks.length > 0) {
        setBlocks(savedBlocks.map((b: any) => ({ ...b, id: b.id || crypto.randomUUID() })))
      } else {
        setBlocks([
          {
            id: crypto.randomUUID(),
            type: 'text',
            content: description || 'Описание вашей компании...',
          },
        ])
      }
    } catch (error: any) {
      console.error(error)
      setToast({ message: error.message || 'Ошибка загрузки', type: 'error' })
      router.push('/dashboard/exhibitor/exhibitions')
    } finally {
      setLoading(false)
    }
  }

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type,
      content: '',
    }
    if (type === 'text') {
      newBlock.content = 'Новый текст'
    }
    setBlocks(prev => [...prev, newBlock])
  }

  const removeBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId))
  }

  const updateBlockContent = (blockId: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content } : b))
  }

  const updateBlockTitle = (blockId: string, title: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, title } : b))
  }

  const handleImageUploadForBlock = async (file: File) => {
    if (uploadingImage) return
    setUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`
      const filePath = `booth-gallery/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('booth-gallery')
        .upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('booth-gallery')
        .getPublicUrl(filePath)
      const publicUrl = publicUrlData.publicUrl

      const newBlock: Block = {
        id: crypto.randomUUID(),
        type: 'image',
        content: publicUrl,
      }
      setBlocks(prev => [...prev, newBlock])
      setToast({ message: 'Изображение добавлено', type: 'success' })
    } catch (error: any) {
      console.error('Ошибка загрузки изображения:', error)
      setToast({ message: error.message || 'Ошибка загрузки изображения', type: 'error' })
    } finally {
      setUploadingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  const handleFileUploadForBlock = async (file: File) => {
    if (uploadingFile) return
    setUploadingFile(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`
      const filePath = `booth-materials/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('booth-materials')
        .upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('booth-materials')
        .getPublicUrl(filePath)
      const publicUrl = publicUrlData.publicUrl

      const newBlock: Block = {
        id: crypto.randomUUID(),
        type: 'file',
        content: publicUrl,
        title: file.name,
      }
      setBlocks(prev => [...prev, newBlock])
      setToast({ message: 'Файл добавлен', type: 'success' })
    } catch (error: any) {
      console.error('Ошибка загрузки файла:', error)
      setToast({ message: error.message || 'Ошибка загрузки файла', type: 'error' })
    } finally {
      setUploadingFile(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const blocksToSave = blocks.map(({ id, ...rest }) => rest)

      const { error: boothError } = await supabase
        .from('booths')
        .update({
          name: boothName,
          description,
          tags,
          blocks: blocksToSave,
        })
        .eq('id', id)

      if (boothError) throw boothError

      const { data: booth } = await supabase
        .from('booths')
        .select('exhibitor_id')
        .eq('id', id)
        .single()

      if (booth?.exhibitor_id) {
        const { error: exhibitorError } = await supabase
          .from('exhibitors')
          .update({
            contact_email: contactEmail,
            contact_phone: contactPhone,
            website,
            description,
          })
          .eq('id', booth.exhibitor_id)

        if (exhibitorError) throw exhibitorError
      }

      setToast({ message: 'Изменения сохранены', type: 'success' })
      setTimeout(() => router.push('/dashboard/exhibitor/exhibitions'), 1500)
    } catch (error: any) {
      console.error('Ошибка сохранения:', error)
      setToast({ message: error.message || 'Ошибка сохранения', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Загрузка...</div>
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: '1rem' }}>
        <Link href="/dashboard/exhibitor/exhibitions" style={{ color: '#6b7280', textDecoration: 'none' }}>
          ← Вернуться к списку выставок
        </Link>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Редактирование стенда</h1>
        <p style={{ color: '#6b7280' }}>Выставка: {exhibitionTitle} • Компания: {companyName}</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Основная информация</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Название стенда</label>
              <input
                type="text"
                value={boothName}
                onChange={(e) => setBoothName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Контактный email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Телефон</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Сайт</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                />
              </div>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Содержимое стенда</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {blocks.map((block) => (
              <div key={block.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                    {block.type === 'text' && 'Текстовый блок'}
                    {block.type === 'image' && 'Изображение'}
                    {block.type === 'video' && 'Видео'}
                    {block.type === 'file' && 'Файл'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    Удалить
                  </button>
                </div>
                {block.type === 'text' && (
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                    rows={4}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  />
                )}
                {block.type === 'image' && (
                  <div>
                    {block.content ? (
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <img
                          src={block.content}
                          alt="Загруженное изображение"
                          style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                        />
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                        <p style={{ marginBottom: '0.5rem' }}>Нет изображения</p>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUploadForBlock(file)
                          }}
                          disabled={uploadingImage}
                          style={{ display: 'none' }}
                          id={`image-upload-${block.id}`}
                        />
                        <label
                          htmlFor={`image-upload-${block.id}`}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            display: 'inline-block',
                          }}
                        >
                          Загрузить изображение
                        </label>
                      </div>
                    )}
                  </div>
                )}
                {block.type === 'video' && (
                  <div>
                    <input
                      type="url"
                      value={block.content}
                      onChange={(e) => updateBlockContent(block.id, e.target.value)}
                      placeholder="https://youtube.com/embed/..."
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                    />
                    {block.content && (
                      <div style={{ marginTop: '1rem', position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                        <iframe
                          src={block.content}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                )}
                {block.type === 'file' && (
                  <div>
                    <input
                      type="text"
                      value={block.title || ''}
                      onChange={(e) => updateBlockTitle(block.id, e.target.value)}
                      placeholder="Название файла"
                      style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                    />
                    {block.content ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <a href={block.content} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                          Открыть файл
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            updateBlockContent(block.id, '')
                            updateBlockTitle(block.id, '')
                          }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          Удалить
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUploadForBlock(file)
                          }}
                          disabled={uploadingFile}
                          style={{ display: 'none' }}
                          id={`file-upload-${block.id}`}
                        />
                        <label
                          htmlFor={`file-upload-${block.id}`}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            display: 'inline-block',
                          }}
                        >
                          Загрузить файл
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <button type="button" onClick={() => addBlock('text')} style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer' }}>
                + Текст
              </button>
              <button
                type="button"
                onClick={() => {
                  const newBlock: Block = { id: crypto.randomUUID(), type: 'image', content: '' }
                  setBlocks(prev => [...prev, newBlock])
                  setTimeout(() => {
                    const input = document.getElementById(`image-upload-${newBlock.id}`)
                    if (input) input.click()
                  }, 50)
                }}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer' }}
              >
                + Изображение
              </button>
              <button type="button" onClick={() => addBlock('video')} style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer' }}>
                + Видео
              </button>
              <button
                type="button"
                onClick={() => {
                  const newBlock: Block = { id: crypto.randomUUID(), type: 'file', content: '', title: '' }
                  setBlocks(prev => [...prev, newBlock])
                  setTimeout(() => {
                    const input = document.getElementById(`file-upload-${newBlock.id}`)
                    if (input) input.click()
                  }, 50)
                }}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer' }}
              >
                + Файл
              </button>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Теги</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {tags.map(tag => (
              <span key={tag} style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="например, cloud"
              style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
            />
            <button type="button" onClick={addTag} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}>Добавить</button>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" onClick={() => router.back()} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer' }}>
            Отмена
          </button>
          <button type="submit" disabled={saving} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </div>
  )
}