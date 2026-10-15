export type Profile = {
  name: string
  organization: string
  email: string
}

const profileStorageKey = 'precoach-profile'

export function getProfile(): Profile {
  const savedProfile = window.localStorage.getItem(profileStorageKey)

  if (!savedProfile) {
    return {
      name: '山田 太郎',
      organization: 'サンプル大学',
      email: 'taro.yamada@example.com',
    }
  }

  try {
    const profile = JSON.parse(savedProfile) as Partial<Profile>
    return {
      name: profile.name || '山田 太郎',
      organization: profile.organization || 'サンプル大学',
      email: profile.email || 'taro.yamada@example.com',
    }
  } catch {
    return {
      name: '山田 太郎',
      organization: 'サンプル大学',
      email: 'taro.yamada@example.com',
    }
  }
}

export function saveProfile(profile: Profile) {
  window.localStorage.setItem(profileStorageKey, JSON.stringify(profile))
}
