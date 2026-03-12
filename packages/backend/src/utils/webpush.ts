/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import webpush from 'web-push'
import config from './config'

webpush.setVapidDetails(config.VAPID_EMAIL, config.VAPID_PUBLIC_KEY, config.VAPID_PRIVATE_KEY)
export default webpush
